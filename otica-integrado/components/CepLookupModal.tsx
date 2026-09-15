"use client";

import { useState, FormEvent } from "react";
import { X } from "lucide-react";

const ESTADOS = [
  { uf: "AC", nome: "Acre" }, { uf: "AL", nome: "Alagoas" }, { uf: "AP", nome: "Amapá" }, { uf: "AM", nome: "Amazonas" },
  { uf: "BA", nome: "Bahia" }, { uf: "CE", nome: "Ceará" }, { uf: "DF", nome: "Distrito Federal" }, { uf: "ES", nome: "Espírito Santo" },
  { uf: "GO", nome: "Goiás" }, { uf: "MA", nome: "Maranhão" }, { uf: "MT", nome: "Mato Grosso" }, { uf: "MS", nome: "Mato Grosso do Sul" },
  { uf: "MG", nome: "Minas Gerais" }, { uf: "PA", nome: "Pará" }, { uf: "PB", nome: "Paraíba" }, { uf: "PR", nome: "Paraná" },
  { uf: "PE", nome: "Pernambuco" }, { uf: "PI", nome: "Piauí" }, { uf: "RJ", nome: "Rio de Janeiro" }, { uf: "RN", nome: "Rio Grande do Norte" },
  { uf: "RS", nome: "Rio Grande do Sul" }, { uf: "RO", nome: "Rondônia" }, { uf: "RR", nome: "Roraima" }, { uf: "SC", nome: "Santa Catarina" },
  { uf: "SP", nome: "São Paulo" }, { uf: "SE", nome: "Sergipe" }, { uf: "TO", nome: "Tocantins" },
];

type CepMatch = { cep: string; logradouro: string; bairro: string; localidade: string; uf: string };

export default function CepLookupModal({ onClose, onSelectCep }: { onClose: () => void; onSelectCep: (cep: string) => void }) {
  const [estado, setEstado] = useState("");
  const [cidade, setCidade] = useState("");
  const [rua, setRua] = useState("");
  const [results, setResults] = useState<CepMatch[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSearch(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setResults(null);

    if (!estado || cidade.trim().length < 3 || rua.trim().length < 3) {
      setError("Preencha estado, cidade e rua (pelo menos 3 letras em cada um).");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`https://viacep.com.br/ws/${estado}/${encodeURIComponent(cidade.trim())}/${encodeURIComponent(rua.trim())}/json/`);
      const data = await response.json();
      if (!response.ok || !Array.isArray(data) || data.length === 0) {
        setResults([]);
      } else {
        setResults(data);
      }
    } catch {
      setError("Não deu pra buscar agora. Tenta de novo em instantes.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[110] flex items-start justify-center overflow-y-auto bg-black/60 p-0 sm:items-center sm:p-4" onClick={onClose}>
      <div className="my-0 w-full overflow-hidden bg-brand-paper shadow-2xl sm:my-auto sm:max-w-md sm:rounded-2xl" onClick={(event) => event.stopPropagation()}>
        <div className="flex items-center justify-between bg-brand-ink px-5 py-4">
          <span className="font-body text-sm font-semibold uppercase tracking-[0.14em] text-brand-paper">Consulta de CEP por endereço</span>
          <button type="button" onClick={onClose} aria-label="Fechar" className="text-brand-paper/80 transition-colors hover:text-brand-gold">
            <X size={20} />
          </button>
        </div>

        <div className="max-h-[75vh] overflow-y-auto p-6">
          <form onSubmit={handleSearch} className="flex flex-col gap-4">
            <div>
              <label className="font-body text-xs font-semibold uppercase tracking-[0.1em] text-brand-ink/60">Estado</label>
              <select value={estado} onChange={(e) => setEstado(e.target.value)} className="mt-1.5 w-full rounded-xl border border-brand-ink/15 bg-white px-3.5 py-2.5 font-body text-sm outline-none focus:border-brand-gold">
                <option value="">Selecione o estado</option>
                {ESTADOS.map((item) => (
                  <option key={item.uf} value={item.uf}>{item.nome}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="font-body text-xs font-semibold uppercase tracking-[0.1em] text-brand-ink/60">Cidade</label>
              <input type="text" value={cidade} onChange={(e) => setCidade(e.target.value)} className="mt-1.5 w-full rounded-xl border border-brand-ink/15 px-3.5 py-2.5 font-body text-sm outline-none focus:border-brand-gold" />
            </div>
            <div>
              <label className="font-body text-xs font-semibold uppercase tracking-[0.1em] text-brand-ink/60">Rua / Avenida / Alameda</label>
              <input type="text" value={rua} onChange={(e) => setRua(e.target.value)} className="mt-1.5 w-full rounded-xl border border-brand-ink/15 px-3.5 py-2.5 font-body text-sm outline-none focus:border-brand-gold" />
            </div>

            {error && <p className="font-body text-sm text-red-600">{error}</p>}

            <button type="submit" disabled={loading} className="rounded-xl bg-brand-ink px-5 py-3 font-body text-sm font-semibold uppercase tracking-[0.1em] text-brand-paper transition-colors hover:bg-brand-gold disabled:opacity-60">
              {loading ? "Buscando..." : "Buscar CEP"}
            </button>
          </form>

          {results && results.length === 0 && (
            <p className="mt-5 font-body text-sm text-brand-ink/60">Não encontramos nenhum CEP com esses dados. Confira a ortografia da rua e da cidade.</p>
          )}

          {results && results.length > 0 && (
            <ul className="mt-5 flex flex-col gap-3">
              {results.slice(0, 15).map((match) => (
                <li key={match.cep} className="rounded-xl border border-brand-ink/10 p-3.5">
                  <p className="font-body text-sm text-brand-ink">
                    {match.bairro ? `${match.bairro}, ` : ""}{match.logradouro || rua}, {match.localidade} - {match.uf}
                  </p>
                  <div className="mt-2 flex items-center justify-between gap-3">
                    <span className="font-body text-sm font-semibold text-brand-ink">{match.cep}</span>
                    <button
                      type="button"
                      onClick={() => {
                        onSelectCep(match.cep);
                        onClose();
                      }}
                      className="rounded-full border border-brand-ink px-4 py-1.5 font-body text-xs font-semibold uppercase tracking-[0.08em] text-brand-ink transition-colors hover:bg-brand-ink hover:text-brand-paper"
                    >
                      Usar este CEP
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
