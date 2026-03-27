-- =============================================================================
-- Migration: update_models
-- Zmiany względem init:
--   User:          RENAME hashedPassword → passwordHash, ALTER name NOT NULL
--   ChildProfile:  ADD interests[], favoriteColor, favoriteAnimal
--   Story:         RENAME profileId → childProfileId, ADD summary/content/
--                  coverImage/language, DROP petName/favoriteColor/favoriteToy
--   StoryVersion:  ADD summary
--   NEW TABLES:    story_likes, story_tags
--   Subscription:  ADD storiesThisMonth, storiesResetAt
-- =============================================================================

-- ---------------------------------------------------------------------------
-- USER
-- ---------------------------------------------------------------------------

-- Zmiana nazwy kolumny (hashedPassword → passwordHash)
ALTER TABLE "users" RENAME COLUMN "hashedPassword" TO "passwordHash";

-- Wymuś NOT NULL na name (istniejące NULL-e zastąp pustym stringiem)
UPDATE "users" SET "name" = '' WHERE "name" IS NULL;
ALTER TABLE "users" ALTER COLUMN "name" SET NOT NULL;

-- ---------------------------------------------------------------------------
-- CHILD PROFILE
-- ---------------------------------------------------------------------------

-- Nowe kolumny
ALTER TABLE "child_profiles"
  ADD COLUMN "interests"      TEXT[]  NOT NULL DEFAULT '{}',
  ADD COLUMN "favoriteColor"  TEXT,
  ADD COLUMN "favoriteAnimal" TEXT;

-- ---------------------------------------------------------------------------
-- STORY
-- ---------------------------------------------------------------------------

-- Zmiana nazwy FK: profileId → childProfileId
ALTER TABLE "stories" RENAME COLUMN "profileId" TO "childProfileId";
ALTER INDEX "stories_profileId_idx" RENAME TO "stories_childProfileId_idx";

-- Nowe kolumny
ALTER TABLE "stories"
  ADD COLUMN "summary"    TEXT,
  ADD COLUMN "content"    TEXT,
  ADD COLUMN "coverImage" TEXT,
  ADD COLUMN "language"   TEXT NOT NULL DEFAULT 'pl';

-- Usunięcie starych kolumn parametrów generacji (przeniesione do ChildProfile)
ALTER TABLE "stories"
  DROP COLUMN IF EXISTS "petName",
  DROP COLUMN IF EXISTS "favoriteColor",
  DROP COLUMN IF EXISTS "favoriteToy";

-- Nowy indeks na status
CREATE INDEX IF NOT EXISTS "stories_status_idx" ON "stories"("status");

-- ---------------------------------------------------------------------------
-- STORY VERSION
-- ---------------------------------------------------------------------------

ALTER TABLE "story_versions" ADD COLUMN "summary" TEXT;

-- ---------------------------------------------------------------------------
-- STORY LIKE  (nowa tabela)
-- ---------------------------------------------------------------------------

CREATE TABLE "story_likes" (
    "id"        TEXT NOT NULL,
    "storyId"   TEXT NOT NULL,
    "userId"    TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "story_likes_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "story_likes_storyId_userId_key" ON "story_likes"("storyId", "userId");
CREATE INDEX "story_likes_userId_idx" ON "story_likes"("userId");

ALTER TABLE "story_likes" ADD CONSTRAINT "story_likes_storyId_fkey"
    FOREIGN KEY ("storyId") REFERENCES "stories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ---------------------------------------------------------------------------
-- STORY TAG  (nowa tabela)
-- ---------------------------------------------------------------------------

CREATE TABLE "story_tags" (
    "id"      TEXT NOT NULL,
    "storyId" TEXT NOT NULL,
    "tag"     TEXT NOT NULL,

    CONSTRAINT "story_tags_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "story_tags_storyId_tag_key" ON "story_tags"("storyId", "tag");
CREATE INDEX "story_tags_tag_idx" ON "story_tags"("tag");

ALTER TABLE "story_tags" ADD CONSTRAINT "story_tags_storyId_fkey"
    FOREIGN KEY ("storyId") REFERENCES "stories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ---------------------------------------------------------------------------
-- SUBSCRIPTION
-- ---------------------------------------------------------------------------

ALTER TABLE "subscriptions"
  ADD COLUMN "storiesThisMonth" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "storiesResetAt"   TIMESTAMP(3);
