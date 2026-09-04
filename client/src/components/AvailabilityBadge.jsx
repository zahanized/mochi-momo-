const STATUS_COLORS = {
  'Deep Focus': 'bg-purple-100 text-purple-700',
  'On a Break': 'bg-yellow-100 text-yellow-700',
  'Open to Chat': 'bg-green-100 text-green-700',
};

function AvailabilityBadge({ userName, status }) {
  const colorClass = STATUS_COLORS[status] || 'bg-gray-100 text-gray-600';
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${colorClass}`}>
      <span className="font-semibold">{userName}</span>
      <span>·</span>
      <span>{status}</span>
    </span>
  );
}

export default AvailabilityBadge;