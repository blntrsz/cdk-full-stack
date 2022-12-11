import { Stack, StackProps } from "aws-cdk-lib";
import { LambdaIntegration, RestApi } from "aws-cdk-lib/aws-apigateway";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from "constructs";
import { handlerClass } from "./cdk-full-stack-stack.my-handler";

export class CdkFullStackStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const fn = new NodejsFunction(this, "my-handler");

    const api = new RestApi(this, "api");

    const hello = api.root.addResource(handlerClass.path);
    hello.addMethod(handlerClass.method, new LambdaIntegration(fn));
  }
}
