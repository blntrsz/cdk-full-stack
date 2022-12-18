deploy:
	aws-vault exec blntrsz -- cdk deploy --outputs-file ./cdk-outputs.json

destroy:
	aws-vault exec blntrsz -- cdk destroy
