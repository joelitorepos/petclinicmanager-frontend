import TaxConfig from './TaxConfig';
import { useLanguage } from '../../../hooks/useLanguage';

const Billing = () => {
  const { t } = useLanguage();
  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-semibold">{t('billing:title')}</h2>
      <TaxConfig />
    </div>
  );
}

export default Billing;