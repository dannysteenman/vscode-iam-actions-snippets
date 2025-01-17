from aws_cdk import (
    Stack,
)
from aws_cdk import (
    aws_iam as iam,
)
from constructs import Construct


class MyStack(Stack):
    def __init__(self, scope: Construct, construct_id: str, **kwargs) -> None:
        super().__init__(scope, construct_id, **kwargs)

        test_role = iam.Role(self, "testRole", assumed_by=iam.ServicePrincipal("lambda.amazonaws.com"))

        test_policy = iam.PolicyStatement(
            actions=[
                "sagemaker:DeleteApp",
                "sagemaker:DeleteSpace",
            ],
            resources=["*"],
            effect=iam.Effect.ALLOW,
        )
        test_role.add_to_principal_policy(test_policy)
