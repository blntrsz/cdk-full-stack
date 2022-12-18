import "./App.css";
import type { handlerFunction } from "../../cdk-full-stack.my-handler";
import { useQuery } from "@tanstack/react-query";
import { CreateHandlerType } from "../../../utils";

const fetchData: CreateHandlerType<typeof handlerFunction> = async (
  body,
  path,
  method
) => {
  const response = await fetch(`${import.meta.env.VITE_APP_API_URL}/${path}`, {
    method,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "*",
      "Access-Control-Allow-Headers": "*",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  return response.json();
};

const fetchGreeting = (name: string) => fetchData({ name }, "hello", "POST");

function App() {
  const { data, isLoading, isError } = useQuery({
    queryFn: () => fetchGreeting("Joe"),
    queryKey: ["hello"],
  });

  if (isError) return <div>Error</div>;
  if (isLoading) return <div>Loading...</div>;

  return <div>{data.msg}</div>;
}

export default App;
