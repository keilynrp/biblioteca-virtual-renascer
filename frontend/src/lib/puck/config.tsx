import type { Config } from '@puckeditor/core'
import { HeroBlockConfig }         from './blocks/HeroBlock'
import { RichTextBlockConfig }     from './blocks/RichTextBlock'
import { FeaturesGridBlockConfig } from './blocks/FeaturesGridBlock'
import { StatsBlockConfig }        from './blocks/StatsBlock'
import { FormBlockConfig }         from './blocks/FormBlock'

import type {
    HeroBlockProps,
    RichTextBlockProps,
    FeaturesGridBlockProps,
    StatsBlockProps,
    FormBlockProps,
} from './types'

type BlockProps = {
    HeroBlock:         HeroBlockProps
    RichTextBlock:     RichTextBlockProps
    FeaturesGridBlock: FeaturesGridBlockProps
    StatsBlock:        StatsBlockProps
    FormBlock:         FormBlockProps
}

export const puckConfig: Config<BlockProps> = {
    components: {
        HeroBlock:         HeroBlockConfig,
        RichTextBlock:     RichTextBlockConfig,
        FeaturesGridBlock: FeaturesGridBlockConfig,
        StatsBlock:        StatsBlockConfig,
        FormBlock:         FormBlockConfig,
    },
}
