import { SubscribeButton } from ".";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { api } from "../../services/api";
import { getStripeJs } from "../../services/stripe-js";

jest.mock("../../services/api");

jest.mock("../../services/stripe-js");

jest.mock("next-auth/react", () => ({
  useSession: jest.fn().mockReturnValue({
    data: null,
    status: "unauthenticated",
  }),
  signIn: jest.fn(),
}));

jest.mock("next/router");

describe("<SubscribeButton />", () => {
  it("should render correctly", () => {
    render(<SubscribeButton />);

    expect(screen.getByText("Subscribe now")).toBeInTheDocument();
  });

  it("should redirects user to sign in when user is not authenticated", () => {
    const signInMocked = jest.mocked(signIn);

    render(<SubscribeButton />);

    const subscribeButton = screen.getByText("Subscribe now");

    fireEvent.click(subscribeButton);

    expect(signInMocked).toHaveBeenCalledTimes(1);
  });

  it("should redirects to posts when user already has a subscription", () => {
    const useRouterMocked = jest.mocked(useRouter);
    const pushMocked = jest.fn();
    useRouterMocked.mockReturnValueOnce({
      push: pushMocked,
    } as any);

    const useSessionMocked = jest.mocked(useSession);
    useSessionMocked.mockReturnValueOnce({
      status: "authenticated",
      data: {
        activeSubscription: "fake-active-subscription",
        expires: "fake-experies",
      },
    });

    render(<SubscribeButton />);

    const subscribeButton = screen.getByText("Subscribe now");

    fireEvent.click(subscribeButton);

    expect(pushMocked).toHaveBeenCalledTimes(1);
    expect(pushMocked).toHaveBeenCalledWith("/posts");
  });

  it("should get session id and send user to subscribe checkout", async () => {
    const useSessionMocked = jest.mocked(useSession);
    useSessionMocked.mockReturnValueOnce({
      status: "authenticated",
      data: {
        activeSubscription: null,
      },
    } as any);

    const apiPostMocked = jest.mocked(api.post);
    apiPostMocked.mockResolvedValueOnce({
      data: {
        sessionId: "fake-subscription-id",
      },
    } as any);

    const getStripeJsMocked = jest.mocked(getStripeJs);
    const redirectToCheckoutMocked = jest.fn();
    getStripeJsMocked.mockResolvedValueOnce({
      redirectToCheckout: redirectToCheckoutMocked,
    } as any);

    render(<SubscribeButton />);

    const subscribeButton = screen.getByRole("button", {
      name: "Subscribe now",
    });

    fireEvent.click(subscribeButton);

    expect(apiPostMocked).toHaveBeenCalledWith("/subscribe");

    await waitFor(() => {
      expect(getStripeJsMocked).toHaveBeenCalledTimes(1);
      expect(redirectToCheckoutMocked).toHaveBeenCalledWith({
        sessionId: "fake-subscription-id",
      });
    });
  });

  it("should call console error if subscribe checkout fails", async () => {
    jest.clearAllMocks();
    jest.resetAllMocks();

    const useSessionMocked = jest.mocked(useSession);
    useSessionMocked.mockReturnValueOnce({
      status: "authenticated",
      data: {
        activeSubscription: null,
      },
    } as any);

    const apiPostMocked = jest.mocked(api.post);
    apiPostMocked.mockResolvedValueOnce({
      data: {
        sessionId: "fake-subscription-id",
      },
    } as any);

    const getStripeJsMocked = jest.mocked(getStripeJs);
    const redirectToCheckoutMocked = jest
      .fn()
      .mockRejectedValueOnce(new Error("fake-error"));
    getStripeJsMocked.mockResolvedValueOnce({
      redirectToCheckout: redirectToCheckoutMocked,
    } as any);

    render(<SubscribeButton />);

    const subscribeButton = screen.getByRole("button", {
      name: "Subscribe now",
    });

    fireEvent.click(subscribeButton);

    const consoleErrorSpy = jest.spyOn(console, "error");

    await waitFor(() => {
      expect(apiPostMocked).toHaveBeenCalledWith("/subscribe");
      expect(getStripeJsMocked).toHaveBeenCalledTimes(1);
      expect(consoleErrorSpy).toHaveBeenCalledWith("fake-error");
    });
  });
});
