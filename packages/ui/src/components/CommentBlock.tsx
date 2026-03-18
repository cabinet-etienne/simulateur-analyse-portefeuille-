import type { Comment } from "@repo/core-domain";

import { Badge } from "./Badge";
import { cn } from "./cn";

interface CommentBlockProps {
  comments: Comment[];
  className?: string;
}

const severityConfig = {
  POSITIVE: { variant: "positive" as const, icon: "+" },
  WARNING: { variant: "warning" as const, icon: "!" },
  NEGATIVE: { variant: "negative" as const, icon: "-" },
  INFO: { variant: "info" as const, icon: "i" },
};

/**
 * Bloc d'affichage des commentaires automatiques.
 * Chaque commentaire est affiché avec un badge de sévérité et son texte.
 */
export function CommentBlock({ comments, className }: CommentBlockProps) {
  if (comments.length === 0) {
    return (
      <p className={cn("text-sm italic text-brand-400", className)}>
        Aucun commentaire pour ce produit.
      </p>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      {comments.map((comment) => {
        const config = severityConfig[comment.severity];
        return (
          <div key={comment.id} className="flex gap-3">
            <Badge variant={config.variant}>{config.icon}</Badge>
            <p className="text-sm text-brand-800">{comment.text}</p>
          </div>
        );
      })}
    </div>
  );
}
