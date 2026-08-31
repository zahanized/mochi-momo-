import { useState } from 'react';
import { useScratchpad } from '../context/ScratchpadContext';

function isLikelyUrl(text) {
  return /^https?:\/\//i.test(text.trim());
}

function Scratchpad() {
  const { entries, loading, error, addEntry } = useScratchpad();
  const [input, setInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    setSubmitting(true);
    setFormError('');
    try {
      await addEntry(input);
      setInput('');
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const openLink = (url) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="mb-4 rounded-lg bg-white p-4 shadow">
      <h2 className="mb-2 text-sm font-semibold text-gray-700">📌 Shared Scratchpad</h2>

      <div className="mb-3 max-h-32 overflow-y-auto rounded border border-gray-100 p-2">
        {loading && entries.length === 0 && (
          <p className="text-xs text-gray-400">Loading...</p>
        )}
        {!loading && entries.length === 0 && (
          <p className="text-xs text-gray-400">Nothing here yet — add a link or note below.</p>
        )}
        {entries.map((entry) => (
          <div key={entry._id} className="mb-1 text-sm">
            <span className="font-semibold text-purple-600">{entry.addedBy?.name || 'Someone'}: </span>
            {isLikelyUrl(entry.content) ? (
              <span
                onClick={() => openLink(entry.content)}
                className="cursor-pointer text-blue-600 underline"
              >
                {entry.content}
              </span>
            ) : (
              <span>{entry.content}</span>
            )}
          </div>
        ))}
      </div>

      {(formError || error) && (
        <p className="mb-2 text-xs text-red-500">{formError || error}</p>
      )}

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Add a link or note..."
          className="flex-1 rounded border border-gray-300 p-1.5 text-sm"
        />
        <button
          type="submit"
          disabled={submitting}
          className="rounded bg-purple-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-purple-700 disabled:opacity-50"
        >
          Add
        </button>
      </form>
    </div>
  );
}

export default Scratchpad;