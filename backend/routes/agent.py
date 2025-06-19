from fastapi import APIRouter
from pydantic import BaseModel
from langchain_core.messages import HumanMessage
from langchain_google_genai import ChatGoogleGenerativeAI
# https://python.langchain.com/docs/integrations/chat/google_generative_ai/
import getpass
import os

if "GOOGLE_API_KEY" not in os.environ:
    os.environ["GOOGLE_API_KEY"] = getpass.getpass("Enter your Google AI API key: ")

router = APIRouter()


class AgentRequest(BaseModel):
    message: str


@router.post("/invoke")
async def invoke_agent(request: AgentRequest):
    # Initialize the Gemini model
    # Make sure you have GOOGLE_API_KEY set in your environment variables
    model = ChatGoogleGenerativeAI(model="gemini-2.0-flash")

    # For this simple example, we'll just invoke the model directly
    # In the future, you can replace this with your LangGraph agent
    response = model.invoke([HumanMessage(content=request.message)])

    return {"response": response.content}
