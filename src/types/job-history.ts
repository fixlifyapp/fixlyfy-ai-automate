
export interface HistoryItem {
  id: string;
  job_id: string;
  entity_id?: string;
  entity_type?: string;
  type: string;
  title: string;
  description: string;
  user_id?: string;
  user_name?: string;
  created_at: string;
  meta?: any;
  old_value?: any;
  new_value?: any;
}

export interface HistoryItemInput extends Omit<HistoryItem, "id" | "created_at"> {}
