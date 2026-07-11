export interface AdminTraining {
    id: number;
    title: string;
    description: string;
    url: string;
    platform: string;
    thumbnail: string | null;
    category: string | null;
    sort_order: number;
    is_required: boolean;
    is_published: boolean;
    created_at: string;
    updated_at: string;
}

export interface AdminTrainingForm {
    title: string;
    description: string;
    url: string;
    platform: string;
    thumbnail: string;
    category: string;
    sort_order: number;
    is_required: boolean;
    is_published: boolean;
}
