import { render, screen } from "@testing-library/react";
import Home, { getStaticProps } from "../../pages/index";
import { stripe } from "../../services/stripe";

jest.mock("next-auth/react", () => ({
  useSession: jest.fn().mockReturnValue({
    data: null,
    status: "loading",
  }),
}));
jest.mock("../../services/stripe");

describe("<Home />", () => {
  it("should renders correctly", () => {
    const product = {
      priceId: "fake-price-id",
      amount: "R$10,00",
    };

    render(<Home product={product} />);

    expect(screen.getByText("for R$10,00 month")).toBeInTheDocument();
  });

  it("should loads initial data from getStatcProps", async () => {
    const stripePricesRetriveMocked = jest.mocked(stripe.prices.retrieve);
    stripePricesRetriveMocked.mockResolvedValueOnce({
      id: "fake-price-id",
      unit_amount: 1000,
    } as any);

    const response = await getStaticProps(null);

    expect(response).toEqual(
      expect.objectContaining({
        props: {
          product: {
            priceId: "fake-price-id",
            amount: "$10.00",
          },
        },
      })
    );
  });
});
