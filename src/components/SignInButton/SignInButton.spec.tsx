import { SignInButton } from ".";
import { render, screen, fireEvent } from "@testing-library/react";
import { useSession, signOut, signIn } from "next-auth/react";

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

  it("should call signOut function when user is not logged and button is clicked", () => {
    const useSessionMocked = jest.mocked(useSession);
    const signOutMocked = jest.mocked(signOut);

    useSessionMocked.mockReturnValueOnce({
      status: "authenticated",
      data: {
        user: {
          name: "fake-name",
        },
      },
    } as any);

    render(<SignInButton />);

    const button = screen.getByRole("button", {
      name: "fake-name",
    });

    fireEvent.click(button);

    expect(signOutMocked).toHaveBeenCalledTimes(1);
  });

  it('should call signIn function when user is not logged and button is clicked', () => {
    const useSessionMocked = jest.mocked(useSession);
    const signInMocked = jest.mocked(signIn);

    useSessionMocked.mockReturnValueOnce({
      status: "unauthenticated",
      data: null,
    } as any);

    render(<SignInButton />);

    const button = screen.getByRole("button", {
      name: "Sign in with Github",
    });

    fireEvent.click(button);

    expect(signInMocked).toHaveBeenCalledTimes(1);
  })
});
