const priorityCls = {
  high: 'bg-red-100 text-red-700',
  medium: 'bg-amber-100 text-amber-700',
  low: 'bg-green-100 text-green-700',
};
const statusCls = {
  pending: 'bg-slate-100 text-slate-700',
  'in-progress': 'bg-blue-100 text-blue-700',
  completed: 'bg-emerald-100 text-emerald-700',
};
export const statusLabel = { pending: 'Pending', 'in-progress': 'In Progress', completed: 'Completed' };

export const PriorityBadge = ({ value }) => (
  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${priorityCls[value]}`}>
    {value}
  </span>
);

export const StatusBadge = ({ value }) => (
  <span className={`whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ${statusCls[value]}`}>
    {statusLabel[value]}
  </span>
);
