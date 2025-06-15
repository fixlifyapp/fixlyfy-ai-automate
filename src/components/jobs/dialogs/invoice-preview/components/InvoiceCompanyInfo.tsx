
interface InvoiceCompanyInfoProps {
  companyName?: string;
  companyAddress?: string;
  companyCity?: string;
  companyState?: string;
  companyZip?: string;
  companyPhone?: string;
  companyEmail?: string;
}

export const InvoiceCompanyInfo = ({
  companyName = "Fixlyfy Services Inc.",
  companyAddress = "123 Business Park, Suite 456",
  companyCity = "San Francisco",
  companyState = "CA",
  companyZip = "94103",
  companyPhone = "(555) 123-4567",
  companyEmail = "contact@fixlyfy.com"
}: InvoiceCompanyInfoProps) => {
  return (
    <div>
      <h3 className="font-semibold text-gray-900 mb-3">From:</h3>
      <div className="text-gray-700">
        <div className="font-medium">{companyName}</div>
        <div>{companyAddress}</div>
        <div>{companyCity}, {companyState} {companyZip}</div>
        <div>{companyPhone}</div>
        <div>{companyEmail}</div>
      </div>
    </div>
  );
};
