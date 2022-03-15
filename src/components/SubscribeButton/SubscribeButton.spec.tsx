import { SubscribeButton } from ".";
import { render, screen, fireEvent } from "@testing-library/react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/router";

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
});
