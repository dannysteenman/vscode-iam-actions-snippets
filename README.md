# AWS IAM Actions Snippets for VS Code

[![](https://img.shields.io/visual-studio-marketplace/v/dannysteenman.iam-actions-snippets?color=374151&label=Visual%20Studio%20Marketplace&labelColor=000&logo=visual-studio-code&logoColor=0098FF)](https://marketplace.visualstudio.com/items?itemName=dannysteenman.iam-actions-snippets)
[![](https://img.shields.io/visual-studio-marketplace/v/dannysteenman.iam-actions-snippets?color=374151&label=Open%20VSX%20Registry&labelColor=000&logo=data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPHN2ZyB2aWV3Qm94PSI0LjYgNSA5Ni4yIDEyMi43IiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgogIDxwYXRoIGQ9Ik0zMCA0NC4yTDUyLjYgNUg3LjN6TTQuNiA4OC41aDQ1LjNMMjcuMiA0OS40em01MSAwbDIyLjYgMzkuMiAyMi42LTM5LjJ6IiBmaWxsPSIjYzE2MGVmIi8+CiAgPHBhdGggZD0iTTUyLjYgNUwzMCA0NC4yaDQ1LjJ6TTI3LjIgNDkuNGwyMi43IDM5LjEgMjIuNi0zOS4xem01MSAwTDU1LjYgODguNWg0NS4yeiIgZmlsbD0iI2E2MGVlNSIvPgo8L3N2Zz4=&logoColor=0098FF)](https://open-vsx.org/extension/dannysteenman/iam-actions-snippets)
[![Installs](https://img.shields.io/visual-studio-marketplace/i/dannysteenman.iam-actions-snippets 'Currently Installed')](https://marketplace.visualstudio.com/items?itemName=dannysteenman.iam-actions-snippets)
[![Rating](https://img.shields.io/visual-studio-marketplace/stars/dannysteenman.iam-actions-snippets)](https://marketplace.visualstudio.com/items?itemName=dannysteenman.iam-actions-snippets)

This AWS IAM Actions Snippets extension equips Visual Studio Code with comprehensive snippets for all AWS IAM actions. It's your essential tool for efficient and accurate IAM policy development.

---

> [!TIP]
> **Launch Faster on AWS and Become Fully Secure From Day One!** Our AWS Landing Zone Foundation service helps B2B companies achieve SOC 2 compliance 90% faster,  redirect 30% of engineering time back to product development all while eliminating the six-figure cost of specialized cloud engineers. so you can focus on shipping your product, instead of worrying about managing your infrastructure on AWS.
>
> [Schedule a free introduction call](https://towardsthecloud.com/contact) to discover how we can deliver 10x the value of securing and building your infrastructure on AWS for a fraction of the cost of a full-time cloud engineer.

<details><summary>☁️ <strong>Learn more about our unique AWS Foundation Service</strong></summary>

<br/>

Is AWS complexity draining your engineering resources? Most B2B startups and growing businesses struggle with overwhelming configuration options, time-consuming compliance requirements, and diverting valuable developer talent away from core product development. Without specialized AWS expertise, you risk security vulnerabilities, mounting technical debt, and delayed time-to-market. All while your competitors race ahead.

Traditional AWS consultancies only compound this problem. They're incentivized to bill by the hour, extending projects indefinitely rather than focusing on your business outcomes. We take the opposite approach. Our fixed-price subscription model proves how confident we are in delivering results, not just billable hours. We succeed when you succeed, aligning our incentives with your growth rather than your AWS complexity.

## Our Solution: Enterprise-Grade AWS Foundation

We deliver an enterprise-grade AWS Landing Zone built entirely in AWS CDK coupled with a support and consultacy foundation that grows with your business needs. Here's what we'll deliver to you:

### We deploy a [Secure and Compliant Landing Zone](https://towardsthecloud.com/services/aws-landing-zone)
- Multi-account architecture with proper security boundaries
  - Achieves a **100% score on the industry-standard [CIS AWS Foundation Benchmark](https://docs.aws.amazon.com/securityhub/latest/userguide/cis-aws-foundations-benchmark.html)**
  - **Achieves a 96% rating on AWS's own [foundational security best practices](https://docs.aws.amazon.com/securityhub/latest/userguide/fsbp-standard.html)**
- Setup entirely using AWS CDK (Infrastructure as Code)
- Budget monitoring and notifications across all accounts
- Deploy changes quickly through GitHub Actions
- We're continuously adding new features as listed on our [Roadmap](https://github.com/towardsthecloud/aws-cdk-landing-zone-roadmap)

### We upskill and accelerate your Developers
- They gain access to our library of ready-to-use, security-hardened AWS CDK components
- They receive guidance on how to utilize AWS best practices for your architecture so you avoid technical debt later on

### We monitor and maintain the multi-account setup & provide ongoing support
- Gain new Landing Zone features once they're released and get free maintenance and security updates
- Get priority support through Slack/Teams whenever you need assistance with infrastructure challenges
- We proactively do quarterly [security](https://towardsthecloud.com/services/aws-security-review) and [cost optimization](https://towardsthecloud.com/services/aws-cost-optimization) assessments to verify AWS account compliance and provide advice to reduce your AWS bill

### What This Means For Your Business
- **30% Lower TCO**: Cut your Total Cost of Ownership (TCO) by up to 30% through right-sized resources and architectural optimization while eliminating the $150K+ annual cost of a specialized AWS hire
- **Close Enterprise Deals Faster**: Win enterprise clients with SOC2 compliance ready in weeks instead of months - our clients report 50% faster sales cycles with security-conscious customers
- **Unleash Your Development Team**: Redirect up to 30% of engineering time from infrastructure back to revenue-generating product features with our pre-built, compliant components
- **Scale Without Infrastructure Headaches**: Grow from startup to enterprise without ever rebuilding your foundation - our architecture scales seamlessly from your first customer to your millionth

We deliver all of this as a [simple subscription service](https://towardsthecloud.com/pricing). No large upfront costs, no lock-in. You'll essentially get a solid and secure landing zone foundation + a decade of AWS expertise without having to hire a full-time Cloud Engineer.

<a href="https://towardsthecloud.com/contact"><img alt="Schedule a free introduction call" src="https://img.shields.io/badge/schedule%20a%20free%20introduction%20call-success.svg?style=for-the-badge"/></a>
</details>

## Features

1. **Comprehensive Coverage**: Offers snippets for **all** AWS IAM actions available across various AWS services.
2. **Auto-completion**: Provides intelligent auto-completion for IAM actions as you type.
3. **Documentation Links**: Quick access to AWS documentation for each IAM action directly from the snippet.
4. **Flexible Format Support**: Supports IAM policies in JSON, but also IAM Policies defined in CloudFormation templates (`.json, .yaml`), and Terraform files (`.tf`).
5. **Up-to-Date**: Regularly updated to reflect the latest AWS IAM actions.
6. **Smart Hover Information**: When hovering over wildcard actions, displays all matching IAM actions, providing a comprehensive view of the permissions covered.

## Usage

1. Install the AWS IAM Actions Snippets extension in VS Code.
2. Open or create a new `.json`, `.yml`, or `.tf` file for your IAM policy.
3. Start typing an IAM action name (e.g., `s3:Get`) in the appropriate place in your policy.
4. The extension will provide auto-completion suggestions for matching IAM actions.
5. Select the desired action to insert it into your policy.

Example of auto-completion in action:

![IAM Actions Snippets Autocomplete Example](https://raw.githubusercontent.com/dannysteenman/vscode-iam-actions-snippets/main/images/iam-actions-snippets-autocomplete-example.gif)

and an example of the hover information:

![IAM Actions Snippets Hover Example](https://raw.githubusercontent.com/dannysteenman/vscode-iam-actions-snippets/main/images/iam-actions-snippets-hover-example.gif)

> **Note:** If auto-completion doesn't trigger automatically, press `Ctrl+Space` (or `Cmd+Space` on macOS) to manually invoke IntelliSense.

---
## Support

If you have a feature request or an issue, please let me know on [Github](https://github.com/towardsthecloud/vscode-iam-actions-snippets/issues)

## Author

[Danny Steenman](https://towardsthecloud.com/about)

[![](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/company/towardsthecloud)
[![](https://img.shields.io/badge/X-000000?style=for-the-badge&logo=x&logoColor=white)](https://twitter.com/dannysteenman)
[![](https://img.shields.io/badge/GitHub-2b3137?style=for-the-badge&logo=github&logoColor=white)](https://github.com/towardsthecloud)
