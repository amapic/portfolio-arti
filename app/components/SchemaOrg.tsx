export const SchemaOrg = () => {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Person",
          name: "Amaury Pichat",
          jobTitle: "Consultant GED",
          description: "Expert en gestion électronique de documents et solutions Documentum",
          url: "https://www.amaurypichat.fr",
          sameAs: [
            "https://www.linkedin.com/in/amaurypichat/",
            // Autres profils sociaux
          ],
          knowsAbout: [
            "GED",
            "Documentum",
            "OpenText",
            "ECM",
            "Gestion documentaire"
          ],
          worksFor: {
            "@type": "Organization",
            name: "Consultant Indépendant"
          }
        })
      }}
    />
  );
}; 