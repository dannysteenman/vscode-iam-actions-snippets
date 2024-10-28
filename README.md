# AWS IAM Actions Snippets for VS Code

[![](https://img.shields.io/visual-studio-marketplace/v/dannysteenman.iam-actions-snippets?color=374151&label=Visual%20Studio%20Marketplace&labelColor=000&logo=visual-studio-code&logoColor=0098FF)](https://marketplace.visualstudio.com/items?itemName=dannysteenman.iam-actions-snippets)
[![](https://img.shields.io/visual-studio-marketplace/v/dannysteenman.iam-actions-snippets?color=374151&label=Open%20VSX%20Registry&labelColor=000&logo=data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPHN2ZyB2aWV3Qm94PSI0LjYgNSA5Ni4yIDEyMi43IiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgogIDxwYXRoIGQ9Ik0zMCA0NC4yTDUyLjYgNUg3LjN6TTQuNiA4OC41aDQ1LjNMMjcuMiA0OS40em01MSAwbDIyLjYgMzkuMiAyMi42LTM5LjJ6IiBmaWxsPSIjYzE2MGVmIi8+CiAgPHBhdGggZD0iTTUyLjYgNUwzMCA0NC4yaDQ1LjJ6TTI3LjIgNDkuNGwyMi43IDM5LjEgMjIuNi0zOS4xem01MSAwTDU1LjYgODguNWg0NS4yeiIgZmlsbD0iI2E2MGVlNSIvPgo8L3N2Zz4=&logoColor=0098FF)](https://open-vsx.org/extension/dannysteenman/iam-actions-snippets)
[![Installs](https://img.shields.io/visual-studio-marketplace/i/dannysteenman.iam-actions-snippets 'Currently Installed')](https://marketplace.visualstudio.com/items?itemName=dannysteenman.iam-actions-snippets)
[![Rating](https://img.shields.io/visual-studio-marketplace/stars/dannysteenman.iam-actions-snippets)](https://marketplace.visualstudio.com/items?itemName=dannysteenman.iam-actions-snippets)

This AWS IAM Actions Snippets extension equips Visual Studio Code with comprehensive snippets for all AWS IAM actions. It's your essential tool for efficient and accurate IAM policy development.

> [!TIP]
> Struggling with AWS complexity or stuck on-premise? Let's transform your cloud journey.
>
> [Schedule a call with me](https://towardsthecloud.com/contact) to find out how I can enhance your existing AWS setup or guide your journey from on-premise to the Cloud.
>
> <details><summary>☁️ <strong>Discover more about my one-person business: Towards the Cloud</strong></summary>
>
> <br/>
>
> Hi, I'm Danny – AWS expert and founder of [Towards the Cloud](https://towardsthecloud.com). With over a decade of hands-on experience, I specialized myself in deploying well-architected, highly scalable and cost-effective AWS Solutions using Infrastructure as Code (IaC).
>
> #### When you work with me, you're getting a package deal of expertise and personalized service:
>
> - **AWS CDK Proficiency**: I bring deep AWS CDK knowledge to the table, ensuring your infrastructure is not just maintainable and scalable, but also fully automated.
> - **AWS Certified**: [Equipped with 7 AWS Certifications](https://www.credly.com/users/dannysteenman/badges), including DevOps Engineer & Solutions Architect Professional, to ensure best practices across diverse cloud scenarios.
> - **Direct Access**: You work with me, not a team of managers. Expect quick decisions and high-quality work.
> - **Tailored Solutions**: Understanding that no two businesses are alike, I Custom-fit cloud infrastructure for your unique needs.
> - **Cost-Effective**: I'll optimize your AWS spending without cutting corners on performance or security.
> - **Seamless CI/CD**: I'll set up smooth CI/CD processes using GitHub Actions, making changes a breeze through Pull Requests.
>
> *My mission is simple: I'll free you from infrastructure headaches so you can focus on what truly matters – your core business.*
>
> Ready to unlock the full potential of AWS Cloud?
>
> <a href="https://towardsthecloud.com/contact"><img alt="Schedule your call" src="https://img.shields.io/badge/schedule%20your%20call-success.svg?style=for-the-badge"/></a>
> </details>

---

## Features

1. **Comprehensive Coverage**: Offers snippets for **all** AWS IAM actions available across various AWS services.
2. **Auto-completion**: Provides intelligent auto-completion for IAM actions as you type.
3. **Documentation Links**: Quick access to AWS documentation for each IAM action directly from the snippet.
4. **Flexible Support**: Works seamlessly with both YAML and JSON IAM policy documents.
5. **Up-to-Date**: Regularly updated to reflect the latest AWS IAM actions.
6. **Smart Hover Information**: When hovering over wildcard actions, displays all matching IAM actions, providing a comprehensive view of the permissions covered.

## Usage

1. Install the AWS IAM Actions Snippets extension in VS Code.
2. Open or create a new `.json` or `.yml` file for your IAM policy.
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

If you have a feature request or an issue, please let me know on [Github](https://github.com/dannysteenman/vscode-iam-actions-snippets/issues)

## Author

[Danny Steenman](https://towardsthecloud.com/about)

[![](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/dannysteenman)
[![](https://img.shields.io/badge/X-000000?style=for-the-badge&logo=x&logoColor=white)](https://twitter.com/dannysteenman)
[![](https://img.shields.io/badge/GitHub-2b3137?style=for-the-badge&logo=github&logoColor=white)](https://github.com/dannysteenman)
