import "../index.css";

function WarningModal({ count }) {

  if (!count) return null;

  return (

    <div className="warning-overlay">

      <div className="warning-card">

        <h2>⚠ Warning</h2>

        <p>

          You switched tabs or left the interview window.

        </p>

        <h3>

          Warning {count} / 3

        </h3>

      </div>

    </div>

  );

}

export default WarningModal;