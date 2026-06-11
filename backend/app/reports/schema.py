from pydantic import BaseModel


class ReportItem(BaseModel):
    name: str
    count: int
    unit: str
