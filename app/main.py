"""Pizzaz demo MCP server implemented with the Python FastMCP helper.

The server mirrors the Node example in this repository and exposes
widget-backed tools that render the Pizzaz UI bundle. Each handler returns the
HTML shell via an MCP resource and echoes the selected topping as structured
content so the ChatGPT client can hydrate the widget. The module also wires the
handlers into an HTTP/SSE stack so you can run the server with uvicorn on port
8000, matching the Node transport behavior."""

from __future__ import annotations

from copy import deepcopy
from dataclasses import dataclass
from typing import Any, Dict, List

import mcp.types as types
from mcp.server.fastmcp import FastMCP
from pydantic import BaseModel, ConfigDict, Field, ValidationError


@dataclass(frozen=True)
class DXBInteractWidgets:
    identifier: str
    title: str
    template_uri: str
    invoking: str
    invoked: str
    html: str
    response_text: str


widgets: List[DXBInteractWidgets] = [
    DXBInteractWidgets(
        identifier="DXB Table",
        title="Show table",
        template_uri="ui://widget/table.html",
        invoking="Fetch table data",
        invoked="Here you go",
        html=(
            "<div id=\"table-root\"></div>\n"
            "<link rel=\"stylesheet\" href=\"http://localhost:4444/table-2d2b.css\">"
            "<script type=\"module\" src=\"http://localhost:4444/table-2d2b.js\"></script>"
        ),
        response_text="Rendered the table!",
    ),
    DXBInteractWidgets(
        identifier="DXB Listings",
        title="Show listing",
        template_uri="ui://widget/listings.html",
        invoking="Fetch listing data",
        invoked="Here you go",
        html=(
            "<div id=\"listings-root\"></div>\n"
            "<link rel=\"stylesheet\" href=\"http://localhost:4444/listings-2d2b.css\">"
            "<script type=\"module\" src=\"http://localhost:4444/listings-2d2b.js\"></script>"
        ),
        response_text="Rendered the listing!",
    ),
    DXBInteractWidgets(
        identifier="DXB Map",
        title="Show map",
        template_uri="ui://widget/map.html",
        invoking="Fetch map data",
        invoked="Here you go",
        html=(
            "<div id=\"map-root\"></div>\n"
            "<link rel=\"stylesheet\" href=\"http://localhost:4444/map-2d2b.css\">"
            "<script type=\"module\" src=\"http://localhost:4444/map-2d2b.js\"></script>"
        ),
        response_text="Rendered the map!",
    ),
    DXBInteractWidgets(
        identifier="DXB Transactions",
        title="Show transactions",
        template_uri="ui://widget/transactions.html",
        invoking="Fetch transactions data",
        invoked="Here you go",
        html=(
            "<div id=\"transactions-root\"></div>\n"
            "<link rel=\"stylesheet\" href=\"http://localhost:4444/transactions-2d2b.css\">"
            "<script type=\"module\" src=\"http://localhost:4444/transactions-2d2b.js\"></script>"
        ),
        response_text="Rendered the transactions!",
    )
]


MIME_TYPE = "text/html+skybridge"


WIDGETS_BY_ID: Dict[str, DXBInteractWidgets] = {widget.identifier: widget for widget in widgets}
WIDGETS_BY_URI: Dict[str, DXBInteractWidgets] = {widget.template_uri: widget for widget in widgets}


class DXBMapInput(BaseModel):
    """Schema for DXB Map tools."""

    dxbMap_options: str = Field(
        ...,
        alias="dxbmapOptions",
        description="Options to mention when rendering the widget.",
    )

    model_config = ConfigDict(populate_by_name=True, extra="forbid")


mcp = FastMCP(
    name="dxbmap-python",
    stateless_http=True,
)


TOOL_INPUT_SCHEMA: Dict[str, Any] = {
    "type": "object",
    "properties": {
        "dxbmapOptions": {
            "type": "string",
            "description": "Options to mention when rendering the widget.",
        }
    },
    "required": ["dxbmapOptions"],
    "additionalProperties": False,
}


def _resource_description(widget: DXBInteractWidgets) -> str:
    return f"{widget.title} widget markup"


def _tool_meta(widget: DXBInteractWidgets) -> Dict[str, Any]:
    return {
        "openai/outputTemplate": widget.template_uri,
        "openai/toolInvocation/invoking": widget.invoking,
        "openai/toolInvocation/invoked": widget.invoked,
        "openai/widgetAccessible": True,
        "openai/resultCanProduceWidget": True,
        "annotations": {
          "destructiveHint": False,
          "openWorldHint": False,
          "readOnlyHint": True,
        }
    }


def _embedded_widget_resource(widget: DXBInteractWidgets) -> types.EmbeddedResource:
    return types.EmbeddedResource(
        type="resource",
        resource=types.TextResourceContents(
            uri=widget.template_uri,
            mimeType=MIME_TYPE,
            text=widget.html,
            title=widget.title,
        ),
    )


@mcp._mcp_server.list_tools()
async def _list_tools() -> List[types.Tool]:
    return [
        types.Tool(
            name=widget.identifier,
            title=widget.title,
            description=widget.title,
            inputSchema=deepcopy(TOOL_INPUT_SCHEMA),
            _meta=_tool_meta(widget),
        )
        for widget in widgets
    ]


@mcp._mcp_server.list_resources()
async def _list_resources() -> List[types.Resource]:
    return [
        types.Resource(
            name=widget.title,
            title=widget.title,
            uri=widget.template_uri,
            description=_resource_description(widget),
            mimeType=MIME_TYPE,
            _meta=_tool_meta(widget),
        )
        for widget in widgets
    ]


@mcp._mcp_server.list_resource_templates()
async def _list_resource_templates() -> List[types.ResourceTemplate]:
    return [
        types.ResourceTemplate(
            name=widget.title,
            title=widget.title,
            uriTemplate=widget.template_uri,
            description=_resource_description(widget),
            mimeType=MIME_TYPE,
            _meta=_tool_meta(widget),
        )
        for widget in widgets
    ]


async def _handle_read_resource(req: types.ReadResourceRequest) -> types.ServerResult:
    widget = WIDGETS_BY_URI.get(str(req.params.uri))
    if widget is None:
        return types.ServerResult(
            types.ReadResourceResult(
                contents=[],
                _meta={"error": f"Unknown resource: {req.params.uri}"},
            )
        )

    contents = [
        types.TextResourceContents(
            uri=widget.template_uri,
            mimeType=MIME_TYPE,
            text=widget.html,
            _meta=_tool_meta(widget),
        )
    ]

    return types.ServerResult(types.ReadResourceResult(contents=contents))


async def _call_tool_request(req: types.CallToolRequest) -> types.ServerResult:
    widget = WIDGETS_BY_ID.get(req.params.name)
    if widget is None:
        return types.ServerResult(
            types.CallToolResult(
                content=[
                    types.TextContent(
                        type="text",
                        text=f"Unknown tool: {req.params.name}",
                    )
                ],
                isError=True,
            )
        )

    arguments = req.params.arguments or {}
    try:
        payload = DXBMapInput.model_validate(arguments)
    except ValidationError as exc:
        return types.ServerResult(
            types.CallToolResult(
                content=[
                    types.TextContent(
                        type="text",
                        text=f"Input validation error: {exc.errors()}",
                    )
                ],
                isError=True,
            )
        )

    options = payload.dxbMap_options
    widget_resource = _embedded_widget_resource(widget)
    meta: Dict[str, Any] = {
        "openai.com/widget": widget_resource.model_dump(mode="json"),
        "openai/outputTemplate": widget.template_uri,
        "openai/toolInvocation/invoking": widget.invoking,
        "openai/toolInvocation/invoked": widget.invoked,
        "openai/widgetAccessible": True,
        "openai/resultCanProduceWidget": True,
    }

    return types.ServerResult(
        types.CallToolResult(
            content=[
                types.TextContent(
                    type="text",
                    text=widget.response_text,
                )
            ],
            structuredContent={"dxbmapOptions": options},
            _meta=meta,
        )
    )


mcp._mcp_server.request_handlers[types.CallToolRequest] = _call_tool_request
mcp._mcp_server.request_handlers[types.ReadResourceRequest] = _handle_read_resource


app = mcp.streamable_http_app()

try:
    from starlette.middleware.cors import CORSMiddleware

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_methods=["*"],
        allow_headers=["*"],
        allow_credentials=False,
    )
except Exception:
    pass


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000)