<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

class ContactController extends AbstractController
{
    #[Route('/contact', name: 'app_contact')]
    public function index(): Response
    {

        $logged = $this->isGranted('IS_AUTHENTICATED_FULLY');
        $user = $this->getUser();

        return $this->render('contact/index.html.twig', [
            'logged' => $logged,
            'user' => $user,
            'controller_name' => 'ContactController',
        ]);
    }
}
