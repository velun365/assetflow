import { Link, useNavigate } from "react-router-dom";
const HomePage = () => {
  const nav = useNavigate();
  const onClickButton = () => {
    nav("/members");
  };
  return (
    <div>
      <Link to={"/"}>Home</Link> <br />
      <Link to={"/members/new"}>회원가입</Link> <br />
      <Link to={"/members/search"}>members</Link> <br />
      <Link to={"/assets"}>assets</Link> <br />
      <Link to={"/asset-items"}>asset-items</Link> <br />
      <Link to={"/loans"}>loans</Link> <br />
      <Link to={"/reservations"}>reservations</Link> <br />
      <button onClick={onClickButton}>members 페이지로 이동</button>
    </div>
  );
};

export default HomePage;
