# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

# LES SAJU 원칙

- **셀프축하 톤.** 전통 사주의 부정 표현("남성운이 없다")은 항상 축하로 뒤집는다.
- **워딩 감수성.** "남편" 같은 이성애 전제 워딩 금지 — "남성"으로 표기한다.
- **스테레오타입엔 반전 한 스푼.** 유형 결과가 사람을 가두지 않게 반전 디테일을 섞는다.
- **프라이버시 최우선.** 로그인·저장 없음. 생일은 URL 쿼리로만 흐르고 서버에 남기지 않는다. 결과 페이지는 noindex. 아웃팅 리스크가 있는 기능(연락처 연동, SNS 로그인)은 만들지 않는다.
- **계산은 코드, 해석은 (나중에) LLM.** 만세력·십신·신살은 `src/lib`에서 결정적으로 계산한다.
