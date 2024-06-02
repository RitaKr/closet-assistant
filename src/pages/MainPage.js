import Header from "../components/Header";
import Footer from "../components/Footer";
import clothing from "../assets/images/clothing.jpg";
import man from "../assets/images/man.jpg";
import winter from "../assets/images/winter.jpg";
import summer from "../assets/images/summer.jpg";
import calendar from "../assets/images/calendar.jpg";
import womanCasual from "../assets/images/woman-casual.jpg";
import manBusiness from "../assets/images/man-business.jpg";
import jackets from "../assets/images/jackets.jpg";
import shelves from "../assets/images/shelves.jpg";
import tripPacker from "../assets/images/trip-packer.png";
import { useEffect, useState } from "react";
import { updateUser } from "../utils/AuthManipulations";
import { Link, NavLink } from "react-router-dom";
import Nav from "../components/Nav";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";

function Page({ user }) {
	return (
		<main className="page-main-no-padding">
			<section className="first-page main-section two-col-section">
				<div className="dive-in-text text-container">
					<h1>To dive in</h1>
					<h2>
						Upload the photos of your favorite items to your digital wardrobe
						and get a personalized outfit for each day
					</h2>
					{user ? (
						<NavLink className="button" to="/generate">
							Generate outfit
						</NavLink>
					) : (
						<NavLink className="button" to="/signup">
							Sign up
						</NavLink>
					)}
				</div>

				<div className="photo-of-closet images-container">
					<LazyLoadImage
						alt="closetPhoto"
						effect="blur"
						className="closet-photo"
						src={clothing}
					/>
				</div>
			</section>

			<section className="second-page main-section two-col-section reverse">
				<div className="about-temperature text-container">
					<h1>Don`t get cold or sweat</h1>
					<h2>
						Get an amazing outfit generated according to current temperature and
						your temperature preferences
					</h2>
				</div>
				<div className="photo-collection-seasons images-container absolute-container">
					<LazyLoadImage alt="man" effect="blur" className="man" src={man} />
					<LazyLoadImage
						alt="winter"
						effect="blur"
						className="winter"
						src={winter}
                        
					/>
					<LazyLoadImage
						alt="summer"
						effect="blur"
						className="summer"
						src={summer}
					/>
				</div>
			</section>

			<section className="third-page main-section one-col-section">
				<div className="outfit-calendar text-container">
					<h1>Get your personal outfit calendar</h1>
					<h2>Let closet assistant think ahead instead of you</h2>
				</div>
				<div className="images-container calendar-photo">
					<LazyLoadImage
						alt="calendar"
						effect="blur"
						className="calendar"
						src={calendar}
					/>
				</div>
			</section>

			<section className="fourth-page main-section two-col-section reverse">
				<div className="closet-management text-container">
					<h1>Manage your closet comfortably</h1>

					<ul>
						<li>Filter your items by type, temperature, color and style</li>
						<li>Sort your items by date, name or date of addition</li>
						<li>Search for favorite items via extended search</li>
						<li>Track if your item is in laundry</li>
					</ul>
				</div>
				<div className="photo-collection-styles images-container absolute-container">
					<LazyLoadImage
						alt="woman in casual outfit"
						effect="blur"
						className="woman-casual"
						src={womanCasual}
					/>
					<LazyLoadImage
						alt="man in business outfit"
						effect="blur"
						className="man-business"
						src={manBusiness}
					/>
				</div>
			</section>

			<section className="fifth-page main-section one-col-section">
				<div className="collection-creation">
					<h1>Create collections and save your favorite outfits in 1 click</h1>
				</div>
				<div className="clothing-collections images-container two-col-section">
					<LazyLoadImage
						alt="jackets"
						effect="blur"
						className="jackets"
						src={jackets}
					/>
					<LazyLoadImage
						alt="shelves"
						effect="blur"
						className="shelves"
						src={shelves}
					/>
				</div>
			</section>

			<section className="sixth-page main-section">
				<div className="trip-packer">
					<h1>Prepare for a trip with Closet Assistant</h1>
					<h2>Choose trip dates and get a collection of clothes that you can take</h2>
				</div>
				<div className="image-container trip-packer-photo">
					<LazyLoadImage
						alt="trip packer"
						effect="blur"
						className="trip-packer"
						src={tripPacker}
					/>
				</div>
			</section>

			<section className="seventh-page main-section">
				<div className="start-using">
					<h1>Closet assistant</h1>
					<h2>Start expressing yourself with comfort NOW</h2>
				</div>
				{user ? (
					<NavLink className="button" to="/generate">
						Generate outfit
					</NavLink>
				) : (
					<NavLink className="button" to="/signup">
						Sign up
					</NavLink>
				)}
			</section>
		</main>
	);
}

export default function MainPage() {
	const [user, setUser] = useState(null);
	useEffect(() => {
		updateUser(setUser);
	}, []);

	return (
		<>
			<Header />
			{user && <Nav />}
			<Page user={user} />
			<Footer />
		</>
	);
}
