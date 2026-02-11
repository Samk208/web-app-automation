# Production Upgrade Plan: Global Merchant (Localization)

## 1. Goal
Upgrade **Global Merchant** from a translator to a **Cultural Localization Strategist**. It will ensure marketing copy isn't just translated but "transcreated" to resonate emotionally and culturally with specific target demographics (e.g., Gen Z in Seoul vs. Boomers in Busan).

## 2. Production Grade Requirements

### A. Core Features
1.  **Cultural Nuance Engine**:
    *   Detect sayings, colors, or metaphors that are inappropriate or meaningless in the target culture.
    *   Suggest culturally relevant replacements (e.g., replacing a baseball metaphor with a soccer one for certain regions).
2.  **Brand Voice Enforcement**:
    *   Allow users to upload "Brand Guidelines" (Tone: Witty, Professional, Luxury).
    *   AI must enforce this tone consistency across all localized assets.
3.  **Multimodal Localization (Text + Visuals)**:
    *   Analyze product images. Flag issues (e.g., showing a plug type not used in the target country).
    *   Suggest visual adaptations using Generative AI (concepts).

### B. Advanced Capabilities
*   **SEO-Led Transcreation**: Optimize the localized text for high-volume local keywords (Naver for Korea, Google for US) during the translation process.
*   **A/B Test Generator**: Auto-generate 3 distinct variations of ad copy (e.g., "Emotional appeal", "Feature-focused", "FOMO").

## 3. Tech Stack & APIs
*   **AI**: Gemini 1.5 Pro (strongest at creative nuance and multimodal vision).
*   **Knowledge Base**: Vector DB storing "Brand Guidelines" and "Cultural Factbook".
*   **Integration**: Direct integration with product creation flows.

## 4. Implementation Strategy

### Phase 1: Context & Knowledge Integration
1.  Add `brand_settings` table to store voice/tone preferences.
2.  Build RAG pipeline to retrieve "Cultural Context" for specific regions (e.g., "Korean Marketing Taboos").

### Phase 2: Transcreation Workflow
1.  Update `merchant.ts` to use a multi-step chain:
    *   Step 1: Literal Meaning extraction.
    *   Step 2: Cultural Alignment (Critic).
    *   Step 3: Creative Rewrite (Copywriter).
2.  Implement `scanImageForculturalFit` using Vision capabilities.

### Phase 3: Feedback Loop
1.  Allow user to "Reject" specific phrases. Agent saves this to negative constraints for future.

## 5. Verification Plan
*   **Nuance Test**: Input an idiom like "It's raining cats and dogs" and verify it translates to a local equivalent (not literal).
*   **Tone Test**: Generate copy for "Luxury Watch" vs "Discount Toy" and verify vocabulary shift.
*   **Vision Test**: Upload an image with a culturally specific gesture and see if the underlying model notes it (if applicable) or at least successfully describes the product context.
