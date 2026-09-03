export function ProductFilters({
  q,
  minPrice,
  maxPrice,
  trustTier,
}: {
  q?: string;
  minPrice?: string;
  maxPrice?: string;
  trustTier?: string;
}) {
  return (
    <form
      method="GET"
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "0.6rem",
        alignItems: "flex-end",
        margin: "1rem 0",
      }}
    >
      <div>
        <label htmlFor="q" style={{ display: "block", fontSize: "0.8rem" }}>
          Search
        </label>
        <input id="q" name="q" defaultValue={q} placeholder="Product name" />
      </div>
      <div>
        <label
          htmlFor="minPrice"
          style={{ display: "block", fontSize: "0.8rem" }}
        >
          Min price
        </label>
        <input
          id="minPrice"
          name="minPrice"
          type="number"
          min="0"
          defaultValue={minPrice}
          style={{ width: "6rem" }}
        />
      </div>
      <div>
        <label
          htmlFor="maxPrice"
          style={{ display: "block", fontSize: "0.8rem" }}
        >
          Max price
        </label>
        <input
          id="maxPrice"
          name="maxPrice"
          type="number"
          min="0"
          defaultValue={maxPrice}
          style={{ width: "6rem" }}
        />
      </div>
      <div>
        <label
          htmlFor="trustTier"
          style={{ display: "block", fontSize: "0.8rem" }}
        >
          Stock model
        </label>
        <select id="trustTier" name="trustTier" defaultValue={trustTier ?? ""}>
          <option value="">Any</option>
          <option value="READY_STOCK">Ready stock</option>
          <option value="MADE_TO_ORDER">Made to order</option>
        </select>
      </div>
      <button type="submit">Apply</button>
    </form>
  );
}
