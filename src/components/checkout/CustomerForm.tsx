import { TextAreaField, TextField } from "@/components/ui/Field";
import { useCheckoutDraft, validateCustomer } from "@/store/checkout";
import { useI18n } from "@/i18n";

/**
 * Delivery and contact capture. Field-level rules live in `validateCustomer` so the
 * checkout page can decide whether the address block is mandatory (pickup does not
 * need a street address) without duplicating the logic.
 */
export function CustomerForm({ addressRequired }: { addressRequired: boolean }) {
  const customer = useCheckoutDraft((state) => state.customer);
  const touched = useCheckoutDraft((state) => state.touched);
  const setField = useCheckoutDraft((state) => state.setCustomerField);
  const markTouched = useCheckoutDraft((state) => state.markTouched);

  const { errors } = validateCustomer(customer, addressRequired);
  const { t } = useI18n();
  const errorFor = (field: keyof typeof customer) => {
    const key = touched[field] ? errors[field] : undefined;
    return key ? t(key) : undefined;
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          label={t("form.fullName")}
          name="fullName"
          autoComplete="name"
          placeholder={t("form.fullNamePlaceholder")}
          value={customer.fullName}
          error={errorFor("fullName")}
          onChange={(event) => setField("fullName", event.target.value)}
          onBlur={() => markTouched(["fullName"])}
        />
        <TextField
          label={t("form.email")}
          name="email"
          type="email"
          autoComplete="email"
          placeholder={t("form.emailPlaceholder")}
          value={customer.email}
          error={errorFor("email")}
          onChange={(event) => setField("email", event.target.value)}
          onBlur={() => markTouched(["email"])}
        />
        <TextField
          label={t("form.phone")}
          name="phone"
          type="tel"
          autoComplete="tel"
          placeholder={t("form.phonePlaceholder")}
          hint={t("form.phoneHint")}
          value={customer.phone}
          error={errorFor("phone")}
          onChange={(event) => setField("phone", event.target.value)}
          onBlur={() => markTouched(["phone"])}
        />
        {addressRequired ? (
          <TextField
            label={t("form.city")}
            name="city"
            autoComplete="address-level2"
            placeholder={t("form.cityPlaceholder")}
            value={customer.city}
            error={errorFor("city")}
            onChange={(event) => setField("city", event.target.value)}
            onBlur={() => markTouched(["city"])}
          />
        ) : null}
      </div>

      {addressRequired ? (
        <div className="grid gap-4 sm:grid-cols-[1.6fr_1fr]">
          <TextField
            label={t("form.street")}
            name="addressLine"
            autoComplete="street-address"
            placeholder={t("form.streetPlaceholder")}
            value={customer.addressLine}
            error={errorFor("addressLine")}
            onChange={(event) => setField("addressLine", event.target.value)}
            onBlur={() => markTouched(["addressLine"])}
          />
          <TextField
            label={t("form.postal")}
            name="postalCode"
            autoComplete="postal-code"
            inputMode="numeric"
            placeholder={t("form.postalPlaceholder")}
            value={customer.postalCode}
            error={errorFor("postalCode")}
            onChange={(event) => setField("postalCode", event.target.value)}
            onBlur={() => markTouched(["postalCode"])}
          />
        </div>
      ) : null}

      <TextAreaField
        label={t("form.note")}
        name="note"
        placeholder={t("form.notePlaceholder")}
        value={customer.note}
        onChange={(event) => setField("note", event.target.value)}
      />
    </div>
  );
}
