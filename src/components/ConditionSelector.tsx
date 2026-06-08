'use client';

const CONDITIONS = [
  'Novo',
  'Novo - lacrado',
  'Usado - excelente estado',
  'Usado - marcas leves',
  'Usado - mídia com detalhes',
  'Usado - sem caixa/manual',
  'Reservado para avaliação',
];

interface ConditionSelectorProps {
  value: string;
  onChange: (condition: string) => void;
  required?: boolean;
}

export default function ConditionSelector({ value, onChange, required }: ConditionSelectorProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-warm-200 mb-2">
        Condição do produto {required && <span className="text-red-500">*</span>}
      </label>
      <div className="space-y-2">
        {CONDITIONS.map((c) => (
          <label
            key={c}
            className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition ${
              value === c
                ? 'border-navy-400 bg-navy-400/10'
                : 'border-white/10 hover:border-navy-400/60 bg-white/[0.03]'
            }`}
          >
            <input
              type="radio"
              name="condition_detail"
              value={c}
              checked={value === c}
              onChange={(e) => onChange(e.target.value)}
              className="w-4 h-4 text-navy-700"
            />
            <span className="text-sm text-warm-100">{c}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
