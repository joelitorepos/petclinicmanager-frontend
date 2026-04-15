import InfoNote from './InfoNote';

interface ExampleItem {
  country: string;
  examples: string[];
}

interface ExampleCardsProps {
  label: string;
  items: ExampleItem[];
}

const ExampleCards = ({ label, items }: ExampleCardsProps) => {
  return (
    <div className="space-y-2">
      {/* Label que queda fuera de la InfoNote */}
      <p className="text-sm font-semibold text-[rgb(var(--text))]">{label}</p>
      
      <InfoNote variant="info">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          {items.map((item) => (
            <div 
              key={item.country} 
              className="bg-[rgb(var(--bg)/0.3)] p-2 rounded border border-[rgb(var(--border)/0.5)]"
            >
              <span className="block font-semibold text-[rgb(var(--primary))] mb-1">
                ({item.country}):
              </span>
              <ul className="list-disc list-inside opacity-90 space-y-1">
                {item.examples.map((ex, index) => (
                  <li key={index}>{ex}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </InfoNote>
    </div>
  );
};

export default ExampleCards;