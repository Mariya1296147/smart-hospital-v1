export interface DashboardSummary {
  dashboard: string;
  username: string;
  roles: string[];
  metrics: Record<string, number>;
}
