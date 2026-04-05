from pydantic import BaseModel, ConfigDict, Field
from pydantic.functional_validators import BeforeValidator
from typing import Optional, Annotated

# Compatibility for Pydantic V2 with MongoDB ObjectId
PyObjectId = Annotated[str, BeforeValidator(str)]

class MappingSchema(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    oldConcept: str
    newConcept: str
    similarity: float
    status: str

    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
    )

class UpdateMappingSchema(BaseModel):
    status: Optional[str]

    model_config = ConfigDict(
        arbitrary_types_allowed=True,
    )

class ChatMessage(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    role: str
    text: str

    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
    )
