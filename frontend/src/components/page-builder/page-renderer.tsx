"use client"

// NOTE: Do NOT import "@puckeditor/core/dist/index.css" here.
// Puck's editor CSS is only loaded in the editor route (page-builder/[slug]).
// This component is safe for use on public pages and the dashboard.
import { Render } from '@puckeditor/core'
import { puckConfig } from '@/lib/puck/config'
import type { PuckData } from '@/services/pagesApi'

interface PageRendererProps {
    data: PuckData
}

/**
 * Renders Puck JSON content without any editor UI.
 * Use this on public marketing pages and the dashboard home.
 */
export function PageRenderer({ data }: PageRendererProps) {
    return <Render config={puckConfig} data={data} />
}
