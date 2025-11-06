import React from "react";
import "./Categories.css";

const categories = [
  { icon: "movies_icon.png", label: "Movies" },
  { icon: "sports_icon.png", label: "Sports" },
  { icon: "events_icon.png", label: "Events" }
];

const Categories = () => {
  return (
    <div className="categories">
      {categories.map((category, index) => (
        <div className="category" key={index}>
          <img src={category.icon} alt={`${category.label} Icon`} />
          <span>{category.label}</span>
        </div>
      ))}
    </div>
  );
};

export default Categories;
