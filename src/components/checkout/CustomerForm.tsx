import { TextAreaField, TextField } from "@/components/ui/Field";
import { useCheckoutDraft, validateCustomer } from "@/store/checkout";

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
  const errorFor = (field: keyof typeof customer) =>
    touched[field] ? errors[field] : undefined;

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          label="Full name"
          name="fullName"
          autoComplete="name"
          placeholder="Sokha Chan"
          value={customer.fullName}
          error={errorFor("fullName")}
          onChange={(event) => setField("fullName", event.target.value)}
          onBlur={() => markTouched(["fullName"])}
        />
        <TextField
          label="Email for the receipt"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="sokha@example.com"
          value={customer.email}
          error={errorFor("email")}
          onChange={(event) => setField("email", event.target.value)}
          onBlur={() => markTouched(["email"])}
        />
        <TextField
          label="Mobile number"
          name="phone"
          type="tel"
          autoComplete="tel"
          placeholder="012 345 678"
          hint="The bank sends the payment notice here"
          value={customer.phone}
          error={errorFor("phone")}
          onChange={(event) => setField("phone", event.target.value)}
          onBlur={() => markTouched(["phone"])}
        />
        {addressRequired ? (
          <TextField
            label="City or Khan"
            name="city"
            autoComplete="address-level2"
            placeholder="Phnom Penh"
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
            label="Street address"
            name="addressLine"
            autoComplete="street-address"
            placeholder="No. 24, Street 63, Sangkat Boeung Keng Kang 1"
            value={customer.addressLine}
            error={errorFor("addressLine")}
            onChange={(event) => setField("addressLine", event.target.value)}
            onBlur={() => markTouched(["addressLine"])}
          />
          <TextField
            label="Postal code"
            name="postalCode"
            autoComplete="postal-code"
            inputMode="numeric"
            placeholder="12302"
            value={customer.postalCode}
            error={errorFor("postalCode")}
            onChange={(event) => setField("postalCode", event.target.value)}
            onBlur={() => markTouched(["postalCode"])}
          />
        </div>
      ) : null}

      <TextAreaField
        label="Delivery note (optional)"
        name="note"
        placeholder="Landmark, gate code, or a time to call before arriving"
        value={customer.note}
        onChange={(event) => setField("note", event.target.value)}
      />
    </div>
  );
}
