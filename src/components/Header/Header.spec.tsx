import { Header } from ".";
import { render, screen } from "@testing-library/react";

jest.mock("next/router", () => {
  return {
    useRouter() {
      return {
        pathname: "/",
      };
    },
  };
});

jest.mock('next-auth/react', () => {
    return {
        useSession() {
            return {
                data: null,
                status: 'unauthenticated'
            }
        }
    }
})

describe("<Header />", () => {
  it("should renders correctly", () => {
   render(<Header />);

    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("Posts")).toBeInTheDocument();
  });
});
