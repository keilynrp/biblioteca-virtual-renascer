import type { Config } from '@puckeditor/core'
import { HeroBlockConfig }         from './blocks/HeroBlock'
import { RichTextBlockConfig }     from './blocks/RichTextBlock'
import { FeaturesGridBlockConfig } from './blocks/FeaturesGridBlock'
import { StatsBlockConfig }        from './blocks/StatsBlock'

import type {
    HeroBlockProps,
    RichTextBlockProps,
    FeaturesGridBlockProps,
    StatsBlockProps,
} from './types'

type BlockProps = {
    HeroBlock:         HeroBlockProps
    RichTextBlock:     RichTextBlockProps
    FeaturesGridBlock: FeaturesGridBlockProps
    StatsBlock:        StatsBlockProps
}

export const puckConfig: Config<BlockProps> = {
    components: {
        HeroBlock:         HeroBlockConfig,
        RichTextBlock:     RichTextBlockConfig,
        FeaturesGridBlock: FeaturesGridBlockConfig,
        StatsBlock:        StatsBlockConfig,
    },
}
