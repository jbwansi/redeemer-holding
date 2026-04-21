export default function NewsletterConfirmation({ status }) {
  const isSuccess = status === "success";

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "#0b1220",
      color: "white"
    }}>
      <div style={{
        background: "#1e293b",
        padding: "40px",
        borderRadius: "16px",
        textAlign: "center",
        maxWidth: "500px",
        width: "100%"
      }}>
        <h1 style={{ marginBottom: "16px" }}>
          {isSuccess ? "🎉 Abonnement confirmé" : "❌ Lien invalide"}
        </h1>

        <p style={{ marginBottom: "20px" }}>
          {isSuccess
            ? "Votre abonnement est confirmé avec succès."
            : "Ce lien est invalide ou expiré."}
        </p>

        <a href="/" style={{
          display: "inline-block",
          background: "#ef3b2d",
          padding: "12px 20px",
          borderRadius: "8px",
          color: "white",
          textDecoration: "none"
        }}>
          Retour à l’accueil
        </a>
      </div>
    </div>
  );
}