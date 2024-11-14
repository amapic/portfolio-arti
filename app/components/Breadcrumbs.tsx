export const Breadcrumbs = ({ items }: { items: Array<{ label: string; href: string }> }) => {
  return (
    <nav aria-label="Fil d'Ariane" className="mb-4">
      <ol className="flex items-center space-x-2">
        {items.map((item, index) => (
          <li key={item.href} className="flex items-center">
            {index > 0 && <span className="mx-2">/</span>}
            <a href={item.href} className="hover:text-blue-600">
              {item.label}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}; 