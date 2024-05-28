import Header from "../components/Header";
import Footer from "../components/Footer";
import clothing from "../assets/images/clothing.jpg"
import man from "../assets/images/man.jpg"
import winter from "../assets/images/winter.jpg"
import summer from "../assets/images/summer.jpg"
import calendar from "../assets/images/calendar.jpg"
import womanCasual from "../assets/images/woman-casual.jpg"
import manBusiness from "../assets/images/man-business.jpg"
import jackets from "../assets/images/jackets.jpg"
import shelves from "../assets/images/shelves.jpg"
export default function Page() {
    return (
    <main className="page-main">
        <div className="first-page">
        <section className="dive-in-text">
            <h1>To dive in</h1>
            <h2>Upload the photos of your favourite items to your digital wardrobe and get a personalized outfit for each day</h2>
        </section>
            <button className="start-button">Start</button>
            <div className="photo-of-closet">
                <img src={clothing} className="closet-photo" alt="closetPhoto" />
            </div>
        </div>

        <div className="second-page">
            <section className="about-temperature">
                <h1>Don`t get cold or sweat</h1>
                <h2>Get an amazing outfit generated according to ambient temperature</h2>
            </section>
            <div className="photo-collection-seasons">
                <img src={man} className="man" alt="man" />
                <img src={winter} className="winter" alt="winter" />
                <img src={summer} className="summer" alt="summer" />
            </div>
        </div>

        <div className="third-page">
            <section className="outfit-calendar">
                <h1>Get your personal outfit calendar</h1>
                <h2>Let closet assistant think ahead instead of you</h2>
            </section>
            <div className="calendar-photo">
                <img src={calendar} className="calendar" alt="calendar" />
            </div>
        </div>

        <div className="fourth-page">
            <section className="closet-management">
                <h1>Manage your closet comfortably</h1>
                <h2>Filter your items, search for them and even create an outfit for a specific style</h2>
            </section>
            <div className="photo-collection-styles">
                <img src={womanCasual} className="woman-casual" alt="woman" />
                <img src={manBusiness} className="man-business" alt="man" />
            </div>
        </div>

        <div className="fifth-page">
            <section className="collection-creation">
                <h1>Create collections and manage your favourite outfits</h1>
            </section>
            <div className="clothing-collections">
                <img src={jackets} className="jackets" alt="jackets" />
                <img src={shelves} className="shelves" alt="shelves" />
            </div>
        </div>

        <div className="sixth-page">
            <section className="start-using">
                <h1>Closet assistant</h1>
                <h2>Express yourself with comfort</h2>
            </section>
            <button className="start-button">Start</button>
        </div>

    </main>


)

}

export default function MainPage() {

    return (
        <>
            <Header />
            <MainPage />
            <Footer />
        </>
    );
}
