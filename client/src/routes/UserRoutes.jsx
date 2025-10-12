import { Routes, Route } from "react-router";
import UserLogin from "../pages/UserLogin";
import Playground from "../components/user/Playground";
import BasicSlider from "../components/Test";
import { ContestProvider } from "../contexts/ContestContext";
import { UserProvider } from "../contexts/UserContext";
import { AuthGuard } from "../guards/UserGuard";
import { GuestGuard } from "../guards/UserGuestGuard";

const UserRoutes = () => {
	return (
		<ContestProvider>
			<UserProvider>
				<Routes>
					<Route
						path="login"
						element={
							<GuestGuard redirectTo={"/user/123/playground"}>
								<UserLogin />
							</GuestGuard>
							// <UserLogin />
						}
					/>

					<Route path="code" element={<BasicSlider />} />
					<Route path=":id/instructions" element={<div>Nothing</div>} />
					<Route
						path=":id/playground"
						element={
							<AuthGuard>
								<Playground />
							</AuthGuard>
						}
					/>
				</Routes>
			</UserProvider>
		</ContestProvider>
	);
};

export default UserRoutes;
