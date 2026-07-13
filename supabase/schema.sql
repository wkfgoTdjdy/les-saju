-- LES SAJU 커플 궁합 스키마.
-- 저장하는 것은 생년월일·닉네임뿐이다. 접근은 서버 라우트의 service role 키로만 이루어지고
-- RLS가 켜져 있어 anon 키로는 아무것도 읽을 수 없다. 커플 코드가 사실상의 접근 토큰.

create table if not exists couples (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  a_name text,
  a_birth_date text not null, -- YYYY-MM-DD (calendar 기준의 날짜)
  a_birth_time text,          -- HH:mm
  a_calendar text not null default 'solar', -- solar | lunar | lunar_leap
  b_name text,
  b_birth_date text,
  b_birth_time text,
  b_calendar text,
  report text,                -- AI 해석 리포트 (완성 시 1회 생성, 재생성 없음)
  completed_at timestamptz,   -- 값이 있으면 초대가 소진된 것 (1회 제한)
  created_at timestamptz not null default now()
);

create index if not exists couples_code_idx on couples (code);

alter table couples enable row level security;
