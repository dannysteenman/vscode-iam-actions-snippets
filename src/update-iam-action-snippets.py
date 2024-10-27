import argparse
import json
import os
from concurrent.futures import ThreadPoolExecutor, as_completed
from urllib.parse import urljoin

import requests
from bs4 import BeautifulSoup

# Constants
BASE_URL = "https://docs.aws.amazon.com/service-authorization/latest/reference/"
SERVICES_PAGE = "reference_policies_actions-resources-contextkeys.html"


def parse_arguments():
    parser = argparse.ArgumentParser(description="Scrape IAM actions from AWS documentation")
    parser.add_argument(
        "--output",
        dest="output_file",
        default="iam-actions.json",
        help="Output file name (default: %(default)s)",
    )
    parser.add_argument(
        "--test",
        type=int,
        help="Test mode: specify the number of services to scrape",
    )
    parser.add_argument(
        "--workers",
        type=int,
        default=10,
        help="Number of worker threads for parallel scraping (default: 10)",
    )
    return parser.parse_args()


def get_soup(url):
    response = requests.get(url)
    response.raise_for_status()
    return BeautifulSoup(response.content, "html.parser")


def scrape_service_actions(service_url):
    try:
        soup = get_soup(service_url)
        actions = {}
        prefix = None
        service_name = None

        # Extract the service name
        title = soup.find("h1", class_="topictitle")
        if title:
            service_name = title.text.strip().replace("Actions, resources, and condition keys for ", "").strip()

        # Extract the service prefix
        for p in soup.find_all("p"):
            if "service prefix:" in p.text:
                code_tag = p.find("code", class_="code")
                if code_tag:
                    prefix = code_tag.text.strip()
                    break

        # Find the actions table
        action_table = soup.find("div", class_="table-container").find("table")
        if not action_table:
            return {}, prefix, service_name, service_url

        rows = action_table.find_all("tr")[1:]  # Skip header row
        current_action = None

        for row in rows:
            cells = row.find_all("td")
            if len(cells) == 6:  # This is a new action row
                action_cell = cells[0]
                action_link = action_cell.find("a")
                if action_link:
                    current_action = action_link.text.strip()
                    description = cells[1].text.strip()
                    access_level = cells[2].text.strip()
                    url = urljoin(service_url, action_link.get("href", ""))
                    action_name = f"{prefix}:{current_action}" if prefix else current_action
                    actions[current_action] = {
                        "action_name": action_name,
                        "description": description,
                        "access_level": access_level,
                        "resource_types": [],
                        "condition_keys": [],
                        "url": url,
                    }

                    # Process resource types
                    resource_type_cell = cells[3]
                    resource_type_links = resource_type_cell.find_all("a")
                    for link in resource_type_links:
                        resource_type = {
                            "name": link.text.strip(),
                            "reference_href": urljoin(service_url, link.get("href", "")),
                        }
                        actions[current_action]["resource_types"].append(resource_type)

                    # Process condition keys
                    condition_key_cell = cells[4]
                    condition_key_links = condition_key_cell.find_all("a")
                    for link in condition_key_links:
                        condition_key = {
                            "name": link.text.strip(),
                            "reference_href": urljoin(service_url, link.get("href", "")),
                        }
                        actions[current_action]["condition_keys"].append(condition_key)

            elif len(cells) == 3 and current_action:  # This is a continuation row
                # Process additional resource types
                resource_type_cell = cells[0]
                resource_type_links = resource_type_cell.find_all("a")
                for link in resource_type_links:
                    resource_type = {
                        "name": link.text.strip(),
                        "reference_href": urljoin(service_url, link.get("href", "")),
                    }
                    actions[current_action]["resource_types"].append(resource_type)

                # Process additional condition keys
                condition_key_cell = cells[1]
                condition_key_links = condition_key_cell.find_all("a")
                for link in condition_key_links:
                    condition_key = {
                        "name": link.text.strip(),
                        "reference_href": urljoin(service_url, link.get("href", "")),
                    }
                    actions[current_action]["condition_keys"].append(condition_key)

        return actions, prefix, service_name, service_url
    except Exception as e:
        print(f"Error scraping {service_url}: {str(e)}")
        return {}, None, None, None


def scrape_service(service_name, service_url):
    service_key = os.path.splitext(os.path.basename(service_url))[0]
    if service_key.startswith("list_"):
        service_key = service_key[5:]  # Remove 'list_' prefix

    print(f"Scraping service: {service_name} ({service_key})")

    actions, prefix, scraped_name, reference_url = scrape_service_actions(service_url)
    if actions:
        return service_key, {
            "serviceName": scraped_name or service_name,
            "service_prefix": prefix,
            "actions": actions,
            "reference_url": reference_url,
        }
    else:
        print(f"No valid actions found for {service_name}")
        return None


def scrape_iam_actions(num_services=None, num_workers=10):
    soup = get_soup(BASE_URL + SERVICES_PAGE)
    services = [(link.text.strip(), urljoin(BASE_URL, link["href"])) for link in soup.select("div.highlights li a")]

    if num_services:
        services = services[:num_services]

    iam_actions = {}
    with ThreadPoolExecutor(max_workers=num_workers) as executor:
        future_to_service = {executor.submit(scrape_service, name, url): name for name, url in services}
        for future in as_completed(future_to_service):
            service_name = future_to_service[future]
            try:
                result = future.result()
                if result:
                    service_key, service_actions = result
                    iam_actions[service_key] = service_actions
            except Exception as exc:
                print(f"{service_name} generated an exception: {exc}")

    return iam_actions


def main():
    args = parse_arguments()
    iam_actions = scrape_iam_actions(num_services=args.test, num_workers=args.workers)

    # Create the snippets folder if it doesn't exist
    snippets_path = os.path.abspath("snippets")
    os.makedirs(snippets_path, exist_ok=True)

    # Construct the full file path
    output_file = os.path.join(snippets_path, os.path.basename(args.output_file))

    print(f"Saving actions in: {output_file}")
    try:
        with open(output_file, "w") as file:
            json.dump(iam_actions, file, sort_keys=True, indent=2)
    except IOError as e:
        print(f"Error writing to file: {e}")
        return

    print("File saved successfully.")


if __name__ == "__main__":
    main()
