import "./App.css";
import type { handlerClass } from "../../cdk-full-stack-stack.my-handler";
import { useQuery } from "@tanstack/react-query";
import { GetHandlerType } from "../../../utils";

const fetchData: GetHandlerType<typeof handlerClass> = async (
    body,
    path,
    method
) => {
    const response = await fetch(`${import.meta.env.API_URL}/${path}`, {
        method,
        body: JSON.stringify(body),
    });

    return response.json();
};

const asd = (name: string) => fetchData({ name }, "hello", "POST");

function App() {
    const { data, isLoading, isError } = useQuery({
        queryFn: () => asd("asd"),
        queryKey: ["hello"],
    });

    if (isError) {
        return <div>Error</div>;
    }

    if (isLoading) {
        return <div>Loading...</div>;
    }

    return <div>{data.msg}</div>;
}

export default App;
