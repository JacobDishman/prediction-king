import { useParams, Link, useNavigate } from "react-router-dom";
import { getChatById } from "@/data/mock";
import { ArrowLeft, Crown, Plus, Trash2, Eye } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const CreatePredictionPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const chat = getChatById(id || "");
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [minWager, setMinWager] = useState("10");
  const [kingWager, setKingWager] = useState("");
  const [kingPick, setKingPick] = useState<number | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  if (!chat) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
        <p>Chat not found</p>
        <Link to="/chats" className="text-primary text-sm mt-2">Back to chats</Link>
      </div>
    );
  }

  const addOption = () => {
    if (options.length < 6) setOptions([...options, ""]);
  };

  const removeOption = (idx: number) => {
    if (options.length > 2) {
      const newOptions = options.filter((_, i) => i !== idx);
      setOptions(newOptions);
      if (kingPick === idx) setKingPick(null);
      else if (kingPick !== null && kingPick > idx) setKingPick(kingPick - 1);
    }
  };

  const updateOption = (idx: number, val: string) => {
    const newOptions = [...options];
    newOptions[idx] = val;
    setOptions(newOptions);
  };

  const isValid = question.trim().length > 0
    && options.every((o) => o.trim().length > 0)
    && Number(minWager) >= 1
    && kingPick !== null
    && Number(kingWager) >= Number(minWager);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border bg-card px-3 py-2.5">
        <Link to={`/chat/${id}`} className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex-1">
          <h2 className="font-heading font-bold text-sm">Create Prediction</h2>
          <p className="text-[10px] text-muted-foreground">{chat.name}</p>
        </div>
        <div className="flex items-center gap-1 text-ck-gold">
          <Crown className="h-4 w-4" />
          <span className="text-[10px] font-bold">King</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
        {/* Question */}
        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
            Question
          </label>
          <input
            type="text"
            placeholder="e.g., Who wins Lakers vs Celtics?"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="w-full rounded-lg border border-border bg-secondary px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary"
          />
        </div>

        {/* Options */}
        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
            Answer Options
          </label>
          <div className="space-y-2">
            {options.map((opt, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="text-xs font-bold text-muted-foreground w-5">{idx + 1}.</span>
                <input
                  type="text"
                  placeholder={`Option ${idx + 1}`}
                  value={opt}
                  onChange={(e) => updateOption(idx, e.target.value)}
                  className="flex-1 rounded-lg border border-border bg-secondary px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary"
                />
                {options.length > 2 && (
                  <button
                    onClick={() => removeOption(idx)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:text-ck-red hover:bg-ck-red/10 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
          {options.length < 6 && (
            <button
              onClick={addOption}
              className="mt-2 flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
            >
              <Plus className="h-3 w-3" /> Add Option
            </button>
          )}
        </div>

        {/* Min Wager */}
        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
            Minimum Wager
          </label>
          <input
            type="number"
            placeholder="10"
            value={minWager}
            onChange={(e) => setMinWager(e.target.value)}
            className="w-full rounded-lg border border-border bg-secondary px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary"
          />
        </div>

        {/* King's Pick */}
        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
            Your Pick (Required)
          </label>
          <div className="flex gap-2 flex-wrap">
            {options.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => setKingPick(idx)}
                disabled={!opt.trim()}
                className={cn(
                  "rounded-lg border px-3 py-2 text-xs font-semibold transition-all",
                  kingPick === idx
                    ? "border-primary bg-primary/15 text-primary"
                    : "border-border bg-secondary text-foreground hover:bg-sb-surface-hover",
                  !opt.trim() && "opacity-30 cursor-not-allowed"
                )}
              >
                {opt.trim() || `Option ${idx + 1}`}
              </button>
            ))}
          </div>
        </div>

        {/* King's Wager */}
        {kingPick !== null && (
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
              Your Wager
            </label>
            <input
              type="number"
              placeholder={`Min ${minWager} pts`}
              value={kingWager}
              onChange={(e) => setKingWager(e.target.value)}
              className="w-full rounded-lg border border-border bg-secondary px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary"
            />
          </div>
        )}

        {/* Preview */}
        {showPreview && isValid && (
          <div className="rounded-xl border border-primary/30 bg-card overflow-hidden">
            <div className="flex items-center gap-1.5 bg-primary/10 px-3 py-2">
              <Eye className="h-3 w-3 text-primary" />
              <span className="text-xs font-bold text-primary uppercase tracking-wide">Preview</span>
            </div>
            <div className="p-3">
              <p className="font-semibold text-sm mb-2">{question}</p>
              <div className="flex gap-2">
                {options.map((opt, idx) => (
                  <div
                    key={idx}
                    className={cn(
                      "flex-1 flex flex-col items-center gap-1 rounded-lg border py-2 px-2",
                      kingPick === idx
                        ? "border-primary bg-primary/15"
                        : "border-border bg-secondary"
                    )}
                  >
                    <span className="text-xs font-bold">{opt}</span>
                    {kingPick === idx && (
                      <span className="text-[9px] text-primary font-medium">{kingWager} pts</span>
                    )}
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-muted-foreground mt-2">Min wager: {minWager} pts</p>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Actions */}
      <div className="border-t border-border bg-card px-4 py-3 space-y-2">
        <button
          onClick={() => setShowPreview(!showPreview)}
          className="w-full rounded-lg border border-border bg-secondary py-2.5 text-sm font-semibold text-foreground hover:bg-sb-surface-hover transition-colors"
        >
          {showPreview ? "Hide Preview" : "Preview"}
        </button>
        <button
          disabled={!isValid}
          onClick={() => navigate(`/chat/${id}`)}
          className={cn(
            "w-full rounded-lg py-2.5 text-sm font-bold transition-colors",
            isValid
              ? "bg-primary text-primary-foreground hover:bg-primary/90"
              : "bg-secondary text-muted-foreground cursor-not-allowed"
          )}
        >
          Post to Chat
        </button>
      </div>
    </div>
  );
};

export default CreatePredictionPage;
