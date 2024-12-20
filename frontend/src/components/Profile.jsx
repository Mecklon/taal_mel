import img2 from "../assets/wallhaven-j3w6om.jpg";
import img from "../assets/goku.jpeg";
import style from "./Profile.module.css";
import { Link } from "react-router-dom";

const Profile = () => {

  return (
    
    <div className={style.profile}>
      <div className={style.imgWrapper}>
        <img src={img2} alt="" className={style.img2} />
        <img src={img} className={style.img} alt="" />
      </div>

      <div className={style.name}>Mecklon Fernandes</div>
      <div className={style.tags}>
        <div className={style.tag}>Guitar</div>
        <div className={style.tag}>Violin</div>
        <div className={style.tag}>Guitar</div>
        <div className={style.tag}>Violin</div>
        <div className={style.tag}>Guitar</div>
        <div className={style.tag}>Violin</div>
        <div className={style.tag}>Guitar</div>
        <div className={style.tag}>Violin</div>
      </div>
      <div className={style.tags}>
        <div className={style.tag}>Classical</div>
        <div className={style.tag}>Rock</div>
        <div className={style.tag}>Classical</div>
        <div className={style.tag}>Rock</div>
      </div>
      <pre className={style.info}>
        {`I am a passionate musician with expertise in both guitar and violin, specializing in rock and classical genres. Over the years, I have honed my skills through performances in diverse settings, from intimate venues to large-scale concerts. My ability to blend the intricate melodies of classical music with the electrifying energy of rock sets me apart as a versatile artist.

        Work Experience:

        Lead Guitarist and Violinist – Eternal Chords Band (2020–Present)

        Performed in over 50 live shows across the country, blending classical violin solos with modern rock arrangements.
        Collaborated with band members to compose and arrange original tracks, one of which was featured on a popular music streaming platform.
        Worked closely with audio engineers to ensure quality recordings of live and studio sessions.
        Session Musician – Independent Projects (2018–2020)

        Contributed guitar and violin tracks for various independent artists' recordings in genres ranging from folk to progressive rock.
        Built a reputation for adaptability and quick learning during studio sessions.
        Classical Ensemble Member – Strings of Harmony Orchestra (2016–2018)

        Performed in a renowned classical orchestra, contributing to major events, including symphony concerts and cultural festivals.
        Assisted in mentoring new members of the violin section.`}
      </pre>
      <div className={style.posts}>
        <Link to={"/profile/post"}>
        <div className={style.post}>
          <div className={style.postTitle}>
            Lorem ipsum dolor sit amet consectetur adipisicing elit
          </div>
        </div>
        </Link>
        <Link to={"/profile/post"}>
        <div className={style.post}>
          <div className={style.postTitle}>
            Lorem ipsum dolor sit amet consectetur adipisicing elit
          </div>
        </div>
        </Link>
        <Link to={"/profile/post"}>
        <div className={style.post}>
          <div className={style.postTitle}>
            Lorem ipsum dolor sit amet consectetur adipisicing elit
          </div>
        </div>
        </Link>
        <Link to={"/profile/post"}>
        <div className={style.post}>
          <div className={style.postTitle}>
            Lorem ipsum dolor sit amet consectetur adipisicing elit
          </div>
        </div>
        </Link>
        <Link to={"/profile/post"}>
        <div className={style.post}>
          <div className={style.postTitle}>
            Lorem ipsum dolor sit amet consectetur adipisicing elit
          </div>
        </div>
        </Link>
        <Link to={"/profile/post"}>
        <div className={style.post}>
          <div className={style.postTitle}>
            Lorem ipsum dolor sit amet consectetur adipisicing elit
          </div>
        </div>
        </Link>
        <Link to={"/profile/post"}>
        <div className={style.post}>
          <div className={style.postTitle}>
            Lorem ipsum dolor sit amet consectetur adipisicing elit
          </div>
        </div>
        </Link>
        <Link to={"/profile/post"}>
        <div className={style.post}>
          <div className={style.postTitle}>
            Lorem ipsum dolor sit amet consectetur adipisicing elit
          </div>
        </div>
        </Link>
        <Link to={"/profile/post"}>
        <div className={style.post}>
          <div className={style.postTitle}>
            Lorem ipsum dolor sit amet consectetur adipisicing elit
          </div>
        </div>
        </Link>
        <Link to={"/profile/post"}>
        <div className={style.post}>
          <div className={style.postTitle}>
            Lorem ipsum dolor sit amet consectetur adipisicing elit
          </div>
        </div>
        </Link>
        <Link to={"/profile/post"}>
        <div className={style.post}>
          <div className={style.postTitle}>
            Lorem ipsum dolor sit amet consectetur adipisicing elit
          </div>
        </div>
        </Link>
        <Link to={"/profile/post"}>
        <div className={style.post}>
          <div className={style.postTitle}>
            Lorem ipsum dolor sit amet consectetur adipisicing elit
          </div>
        </div>
        </Link>
        <Link to={"/profile/post"}>
        <div className={style.post}>
          <div className={style.postTitle}>
            Lorem ipsum dolor sit amet consectetur adipisicing elit
          </div>
        </div>
        </Link>
        <Link to={"/profile/post"}>
        <div className={style.post}>
          <div className={style.postTitle}>
            Lorem ipsum dolor sit amet consectetur adipisicing elit
          </div>
        </div>
        </Link>
        <Link to={"/profile/post"}>
        <div className={style.post}>
          <div className={style.postTitle}>
            Lorem ipsum dolor sit amet consectetur adipisicing elit
          </div>
        </div>
        </Link>
        
      </div>
    </div>
  );
};
export default Profile;
