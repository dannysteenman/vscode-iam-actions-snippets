import * as cdk from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

export class TestStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const testRole = new iam.Role(this, 'testRole', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
    });

    const testPolicy = new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: [
        'sagemaker:DeleteApp',
        'sagemaker:DeleteSpace',
        'sagemaker:DescribeApp',
        'sagemaker:DescribeSpace',
        'sagemaker:CreateEndpoint',
      ],
      resources: ['*'],
    });
    testRole.addToPolicy(testPolicy);
  }
}
