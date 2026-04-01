import { Link } from "react-router-dom";
import { MessageCircle, ShoppingCart } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { whatsappLojaLink, type LojaProduto } from "@/data/lojaProdutos";

export type LojaProdutoModalItem = LojaProduto & { desc?: string };

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  produto: LojaProdutoModalItem | null;
};

const LojaProdutoDialog = ({ open, onOpenChange, produto }: Props) => {
  if (!produto) return null;

  const wa = whatsappLojaLink(produto.nome, produto.preco);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg sm:max-w-xl gap-4 p-4 sm:p-6">
        <DialogHeader className="text-left space-y-2">
          <DialogTitle className="text-base sm:text-lg leading-snug pr-8">{produto.nome}</DialogTitle>
          <DialogDescription className="sr-only">
            Produto à venda. Preço: {produto.preco}.
            {produto.desc ? ` ${produto.desc}` : ""}
          </DialogDescription>
        </DialogHeader>

        <p className="text-base font-semibold text-primary -mt-1">{produto.preco}</p>

        {produto.desc ? <p className="text-sm text-muted-foreground leading-relaxed">{produto.desc}</p> : null}

        <div
          className={cn(
            "flex items-center justify-center rounded-xl overflow-hidden border border-border/60",
            produto.imgLightBg ? "bg-white p-4 min-h-[200px]" : "bg-muted/40 p-2",
          )}
        >
          <img
            src={produto.img}
            alt={produto.nome}
            className="max-h-[min(52vh,400px)] w-full object-contain"
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-1">
          <a
            href={wa}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-400 text-white text-sm font-semibold px-4 py-3 rounded-xl transition-colors"
          >
            <MessageCircle className="h-4 w-4 shrink-0" />
            Comprar
          </a>
          <Link
            to="/loja"
            onClick={() => onOpenChange(false)}
            className="flex-1 flex items-center justify-center gap-2 border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground text-sm font-semibold px-4 py-3 rounded-xl transition-colors"
          >
            <ShoppingCart className="h-4 w-4 shrink-0" />
            Ir para a loja
          </Link>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LojaProdutoDialog;
