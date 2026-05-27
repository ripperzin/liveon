-- Migration: economy_and_quests
-- Description: Creates tables for Quest Claiming, Shop Items, and User Inventory

-- CLAIMED QUESTS
CREATE TABLE public.claimed_quests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    quest_id TEXT NOT NULL,
    claimed_date DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, quest_id, claimed_date)
);

CREATE INDEX idx_claimed_quests_user ON public.claimed_quests(user_id);

-- SHOP ITEMS
CREATE TABLE public.shop_items (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL CHECK (type IN ('title', 'border', 'aura', 'consumable')),
    price INT NOT NULL DEFAULT 0,
    icon TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- USER INVENTORY
CREATE TABLE public.user_inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    item_id TEXT REFERENCES public.shop_items(id) ON DELETE CASCADE NOT NULL,
    is_equipped BOOLEAN DEFAULT false,
    quantity INT DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, item_id)
);

CREATE INDEX idx_user_inventory_user ON public.user_inventory(user_id);

-- SEED SHOP ITEMS
INSERT INTO public.shop_items (id, name, description, type, price, icon) VALUES
('title_pioneer', 'Pioneiro', 'Um título para os primeiros desbravadores.', 'title', 50, '⭐'),
('title_relentless', 'O Implacável', 'Para aqueles que não desistem nunca.', 'title', 150, '🔥'),
('title_zen', 'Mestre Zen', 'Foco, respiração e paz interior.', 'title', 200, '🧘'),
('freeze_1', 'Cristal do Tempo', 'Protege o seu Streak se você esquecer de fazer os hábitos por 1 dia.', 'consumable', 100, '❄️'),
('border_gold', 'Aura Dourada', 'Uma moldura dourada brilhante para o seu avatar.', 'border', 500, '✨');
