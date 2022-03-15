import { SignInButton } from ".";
import { render, screen } from "@testing-library/react";
import { useSession } from "next-auth/react";

jest.mock("next-auth/react");

describe("<SubscribeButton />", () => {
  it("should render correctly", () => {
    const useSessionMocked = jest.mocked(useSession);
    useSessionMocked.mockReturnValueOnce({
      status: "loading",
      data: null,
    });
    render(<SignInButton />);

    expect(screen.getByText("Sign in with Github")).toBeInTheDocument();
  });

  it("should render correctly when user is authenticated", () => {
    const useSessionMocked = jest.mocked(useSession);
    useSessionMocked.mockReturnValue({
      status: "authenticated",
      data: {
        user: {
          name: "fake-name",
        },
        expires: "fake-experies",
      },
    });
    render(<SignInButton />);

    expect(screen.getByText("fake-name")).toBeInTheDocument();
  });

  it("should render correctly when user is not authenticated", () => {
    const useSessionMocked = jest.mocked(useSession);
    useSessionMocked.mockReturnValueOnce({
      status: "unauthenticated",
      data: null,
    });

    render(<SignInButton />);
    expect(screen.getByText("Sign in with Github")).toBeInTheDocument();
  });
});
